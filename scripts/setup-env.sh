#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUPABASE_TEMP_DIR="$ROOT_DIR/supabase/.temp"
SUPABASE_CONFIG_FILE="$ROOT_DIR/supabase/config.toml"
ENV_FILE="$ROOT_DIR/.env.local"
VERCEL_DIR="$ROOT_DIR/.vercel"
# CloseHound is internal-only. Customer-facing branding and outbound email must use WalkPerro.
APP_BRAND="WalkPerro"

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
}

require_file() {
  local file_path="$1"

  if [[ ! -f "$file_path" ]]; then
    echo "Required file not found: $file_path" >&2
    exit 1
  fi
}

mask_value() {
  local value="$1"
  local length="${#value}"

  if (( length <= 8 )); then
    printf '[redacted]'
    return
  fi

  printf '%s…%s' "${value:0:4}" "${value:length-4:4}"
}

detect_supabase_ref() {
  local ref=""

  if [[ -f "$SUPABASE_TEMP_DIR/project-ref" ]]; then
    ref="$(tr -d '[:space:]' < "$SUPABASE_TEMP_DIR/project-ref")"
  fi

  if [[ -z "$ref" && -f "$SUPABASE_TEMP_DIR/linked-project.json" ]]; then
    ref="$(jq -r '.ref // empty' "$SUPABASE_TEMP_DIR/linked-project.json")"
  fi

  if [[ -z "$ref" && -f "$SUPABASE_CONFIG_FILE" ]]; then
    ref="$(sed -nE 's/^project_id[[:space:]]*=[[:space:]]*"([^"]+)".*/\1/p' "$SUPABASE_CONFIG_FILE" | head -n 1)"
  fi

  if [[ -z "$ref" ]]; then
    echo "Unable to detect the linked Supabase project ref from supabase/.temp or supabase/config.toml." >&2
    exit 1
  fi

  printf '%s' "$ref"
}

upsert_env_file_var() {
  local file_path="$1"
  local key="$2"
  local value="$3"
  local temp_file

  temp_file="$(mktemp)"
  touch "$file_path"

  if grep -q "^${key}=" "$file_path"; then
    awk -v target_key="$key" -v target_value="$value" '
      BEGIN { updated = 0 }
      index($0, target_key "=") == 1 && updated == 0 {
        print target_key "=" target_value
        updated = 1
        next
      }
      { print }
      END {
        if (updated == 0) {
          print target_key "=" target_value
        }
      }
    ' "$file_path" > "$temp_file"
  else
    cat "$file_path" > "$temp_file"
    if [[ -s "$temp_file" ]]; then
      printf '\n' >> "$temp_file"
    fi
    printf '%s=%s\n' "$key" "$value" >> "$temp_file"
  fi

  mv "$temp_file" "$file_path"
}

ensure_env_file_var() {
  local file_path="$1"
  local key="$2"
  local value="$3"

  if grep -q "^${key}=" "$file_path" 2>/dev/null; then
    return
  fi

  upsert_env_file_var "$file_path" "$key" "$value"
}

get_supabase_cmd() {
  if command -v supabase >/dev/null 2>&1; then
    printf 'supabase'
    return
  fi

  if command -v npx >/dev/null 2>&1; then
    printf 'npx supabase'
    return
  fi

  return 1
}

run_supabase() {
  local supabase_cmd="$1"
  shift

  if [[ "$supabase_cmd" == "supabase" ]]; then
    supabase "$@"
    return
  fi

  npx supabase "$@"
}

fetch_api_keys_with_cli() {
  local project_ref="$1"
  local supabase_cmd

  if ! supabase_cmd="$(get_supabase_cmd)"; then
    return 1
  fi

  run_supabase "$supabase_cmd" projects api-keys --project-ref "$project_ref" --output json 2>/dev/null
}

fetch_api_keys_with_token() {
  local project_ref="$1"

  if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
    return 1
  fi

  curl -fsSL \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    "https://api.supabase.com/v1/projects/${project_ref}/api-keys?reveal=true"
}

get_vercel_cmd() {
  if command -v vercel >/dev/null 2>&1; then
    printf 'vercel'
    return
  fi

  if command -v npx >/dev/null 2>&1; then
    printf 'npx vercel'
    return
  fi

  echo "Neither vercel nor npx is available." >&2
  exit 1
}

run_vercel() {
  local vercel_cmd="$1"
  shift

  if [[ "$vercel_cmd" == "vercel" ]]; then
    vercel --cwd "$ROOT_DIR" "$@"
    return
  fi

  npx vercel --cwd "$ROOT_DIR" "$@"
}

vercel_env_exists() {
  local vercel_cmd="$1"
  local env_name="$2"
  local key="$3"

  local output
  if ! output="$(run_vercel "$vercel_cmd" env list "$env_name" 2>/dev/null)"; then
    return 1
  fi

  printf '%s\n' "$output" | grep -Eq "(^|[[:space:]])${key}([[:space:]]|$)"
}

upsert_vercel_env() {
  local vercel_cmd="$1"
  local key="$2"
  local value="$3"
  local env_name="$4"

  if vercel_env_exists "$vercel_cmd" "$env_name" "$key"; then
    run_vercel "$vercel_cmd" env update "$key" "$env_name" --value "$value" --yes >/dev/null
    echo "Updated Vercel env: $key ($env_name)"
    return
  fi

  run_vercel "$vercel_cmd" env add "$key" "$env_name" --value "$value" --yes >/dev/null
  echo "Added Vercel env: $key ($env_name)"
}

require_command curl
require_command jq
require_file "$SUPABASE_CONFIG_FILE"

PROJECT_REF="$(detect_supabase_ref)"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

API_KEYS_JSON=""
KEY_SOURCE="unavailable"

if API_KEYS_JSON="$(fetch_api_keys_with_cli "$PROJECT_REF")"; then
  KEY_SOURCE="supabase-cli"
elif API_KEYS_JSON="$(fetch_api_keys_with_token "$PROJECT_REF")"; then
  KEY_SOURCE="supabase-access-token"
else
  echo "Unable to fetch Supabase API keys." >&2
  echo "Run 'supabase login' first, or export SUPABASE_ACCESS_TOKEN as a fallback." >&2
  exit 1
fi

SUPABASE_BROWSER_KEY="$(
  printf '%s' "$API_KEYS_JSON" | jq -r '
    map(select(.name == "publishable"))[0].api_key // map(select(.name == "anon"))[0].api_key // empty
  '
)"

KEY_KIND="$(
  printf '%s' "$API_KEYS_JSON" | jq -r '
    if any(.name == "publishable") then
      "publishable"
    elif any(.name == "anon") then
      "anon"
    else
      empty
    end
  '
)"

if [[ -z "$SUPABASE_BROWSER_KEY" || -z "$KEY_KIND" ]]; then
  echo "No publishable or anon browser key was found for project ${PROJECT_REF}." >&2
  exit 1
fi

upsert_env_file_var "$ENV_FILE" "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
upsert_env_file_var "$ENV_FILE" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_BROWSER_KEY"
upsert_env_file_var "$ENV_FILE" "NEXT_PUBLIC_APP_BRAND" "$APP_BRAND"
ensure_env_file_var "$ENV_FILE" "RESEND_API_KEY" ""
ensure_env_file_var "$ENV_FILE" "RESEND_FROM" ""
ensure_env_file_var "$ENV_FILE" "NOTIFY_SIGNUPS_TO" ""

echo "Wrote local env:"
echo "  .env.local"
echo "  NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=$(mask_value "$SUPABASE_BROWSER_KEY")"
echo "  NEXT_PUBLIC_APP_BRAND=${APP_BRAND}"
echo "  Added blank placeholders if missing: RESEND_API_KEY, RESEND_FROM, NOTIFY_SIGNUPS_TO"
echo "  Key source=${KEY_KIND} via ${KEY_SOURCE}"
echo "  Branding rule: CloseHound is internal-only. Customer-facing branding and outbound email must use WalkPerro."

VERCEL_CMD="$(get_vercel_cmd)"

if [[ ! -d "$VERCEL_DIR" || ! -f "$VERCEL_DIR/project.json" ]]; then
  echo "Vercel project link not found in ${VERCEL_DIR}."
  echo "Run 'vercel link' in ${ROOT_DIR}, then rerun this script."
  exit 1
fi

for env_name in development preview production; do
  upsert_vercel_env "$VERCEL_CMD" "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "$env_name"
  upsert_vercel_env "$VERCEL_CMD" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_BROWSER_KEY" "$env_name"
  upsert_vercel_env "$VERCEL_CMD" "NEXT_PUBLIC_APP_BRAND" "$APP_BRAND" "$env_name"
done

echo "Completed env sync for project ref ${PROJECT_REF}."
