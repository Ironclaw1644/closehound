// Server-rendered JSON-LD <script> injector. Use as:
//   <JsonLd data={buildPreviewJsonLd(model)} />
// The JSON is escaped per https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
// to avoid breaking out of the <script> tag with </script> in nested strings.

type JsonLdValue = unknown;

export function JsonLd({ data, id }: { data: JsonLdValue; id?: string }) {
  // Escape forward-slashes and HTML-special sequences inside <script> blocks.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      id={id}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
