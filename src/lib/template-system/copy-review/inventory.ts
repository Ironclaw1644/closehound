import type { BlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import type { HealthWellnessPreviewModel } from "@/lib/template-system/health-wellness-preview";
import type {
  TemplateCopyInventory,
  TemplateCopyInventoryInput,
  TemplateCopySlot,
  TemplateCopySlotRole,
} from "@/lib/template-system/copy-review/types";

function createCollector(input: {
  templateKey: string;
  familyKey: string;
}) {
  const inventory: TemplateCopyInventory = [];
  let pageOrder = 0;

  function pushSlot(
    sectionKey: TemplateCopySlot["sectionKey"],
    slotKey: string,
    slotRole: TemplateCopySlotRole,
    currentText: string | null | undefined
  ) {
    if (typeof currentText !== "string") {
      return;
    }

    const normalizedText = currentText.trim();

    if (normalizedText === "") {
      return;
    }

    pageOrder += 1;
    inventory.push({
      templateKey: input.templateKey,
      familyKey: input.familyKey,
      sectionKey,
      slotKey,
      slotRole,
      pageOrder,
      currentText: normalizedText,
      status: "unreviewed",
    });
  }

  return {
    inventory,
    pushSlot,
  };
}

function collectBlueCollarInventory(input: {
  templateKey: string;
  familyKey: string;
  previewModel: BlueCollarPreviewModel;
}) {
  const { inventory, pushSlot } = createCollector(input);
  const model = input.previewModel;
  const visibleSectionKeys = new Set(model.sectionKeys);

  pushSlot("hero", "hero.meta.business-name", "hero-meta", model.businessName);
  pushSlot("hero", "hero.heading", "hero-heading", model.hero.heading);
  pushSlot("hero", "hero.body", "hero-body", model.hero.body);
  pushSlot(
    "hero",
    "hero.cta.primary.label",
    "primary-cta-label",
    model.hero.primaryCta.label
  );
  pushSlot(
    "hero",
    "hero.cta.secondary.label",
    "secondary-cta-label",
    model.hero.secondaryCta?.label
  );

  if (visibleSectionKeys.has("services")) {
    pushSlot("services", "services.heading", "section-heading", model.services.heading);
    for (const [index, item] of model.services.items.entries()) {
      pushSlot("services", `services.items.${index}.title`, "card-title", item.title);
      pushSlot("services", `services.items.${index}.body`, "card-body", item.body);
    }
  }

  if (visibleSectionKeys.has("why-choose-us")) {
    pushSlot(
      "why-choose-us",
      "why-choose-us.heading",
      "section-heading",
      model.whyChooseUs.heading
    );
    for (const [index, item] of model.whyChooseUs.items.entries()) {
      pushSlot(
        "why-choose-us",
        `why-choose-us.items.${index}.title`,
        "card-title",
        item.title
      );
      pushSlot(
        "why-choose-us",
        `why-choose-us.items.${index}.body`,
        "card-body",
        item.body
      );
    }
  }

  if (visibleSectionKeys.has("process")) {
    pushSlot("process", "process.heading", "section-heading", model.process.heading);
    for (const [index, item] of model.process.items.entries()) {
      pushSlot("process", `process.items.${index}.title`, "card-title", item.title);
      pushSlot("process", `process.items.${index}.body`, "card-body", item.body);
    }
  }

  if (visibleSectionKeys.has("faq")) {
    pushSlot("faq", "faq.heading", "section-heading", model.faq.heading);
    for (const [index, item] of model.faq.items.entries()) {
      pushSlot("faq", `faq.items.${index}.question`, "faq-question", item.question);
      pushSlot("faq", `faq.items.${index}.answer`, "faq-answer", item.answer);
    }
  }

  if (visibleSectionKeys.has("service-area")) {
    pushSlot(
      "service-area",
      "service-area.heading",
      "section-heading",
      model.serviceArea.heading
    );
    pushSlot(
      "service-area",
      "service-area.body",
      "section-body",
      model.serviceArea.body
    );
  }

  if (visibleSectionKeys.has("contact")) {
    pushSlot("contact", "contact.heading", "section-heading", model.contact.heading);
    pushSlot("contact", "contact.body", "section-body", model.contact.body);
    pushSlot(
      "contact",
      "contact.cta.label",
      "primary-cta-label",
      model.contact.ctaLabel
    );
    pushSlot("contact", "contact.phone", "contact-detail", model.contact.phone);
    pushSlot("contact", "contact.email", "contact-detail", model.contact.email);
  }

  return inventory;
}

function collectHealthWellnessInventory(input: {
  templateKey: string;
  familyKey: string;
  previewModel: HealthWellnessPreviewModel;
}) {
  const { inventory, pushSlot } = createCollector(input);
  const model = input.previewModel;

  const visibleSectionKeys = new Set(model.sectionKeys);

  pushSlot("hero", "hero.meta.service-area", "hero-meta", model.serviceAreaLabel);
  pushSlot("hero", "hero.heading", "hero-heading", model.hero.heading);
  pushSlot("hero", "hero.body", "hero-body", model.hero.body);
  pushSlot(
    "hero",
    "hero.cta.primary.label",
    "primary-cta-label",
    model.primaryCtaLabel
  );
  pushSlot(
    "hero",
    "hero.cta.secondary.label",
    "secondary-cta-label",
    model.secondaryCtaLabel
  );

  if (visibleSectionKeys.has("featured-treatments")) {
    pushSlot(
      "featured-treatments",
      "featured-treatments.heading",
      "section-heading",
      model.treatments.heading
    );
    for (const [index, item] of (model.treatments.items ?? []).entries()) {
      pushSlot(
        "featured-treatments",
        `featured-treatments.items.${index}.title`,
        "card-title",
        item.title
      );
      pushSlot(
        "featured-treatments",
        `featured-treatments.items.${index}.body`,
        "card-body",
        item.body
      );
    }
  }

  if (visibleSectionKeys.has("about")) {
    pushSlot("about", "about.heading", "section-heading", model.about.heading);
    pushSlot("about", "about.body", "section-body", model.about.body);
  }

  if (visibleSectionKeys.has("why-choose-us")) {
    pushSlot(
      "why-choose-us",
      "why-choose-us.heading",
      "section-heading",
      model.whyChooseUs.heading
    );
    for (const [index, item] of (model.whyChooseUs.items ?? []).entries()) {
      pushSlot(
        "why-choose-us",
        `why-choose-us.items.${index}.title`,
        "card-title",
        item.title
      );
      pushSlot(
        "why-choose-us",
        `why-choose-us.items.${index}.body`,
        "card-body",
        item.body
      );
    }
  }

  if (visibleSectionKeys.has("process")) {
    pushSlot("process", "process.heading", "section-heading", model.process.heading);
    for (const [index, item] of (model.process.items ?? []).entries()) {
      pushSlot("process", `process.items.${index}.title`, "card-title", item.title);
      pushSlot("process", `process.items.${index}.body`, "card-body", item.body);
    }
  }

  if (visibleSectionKeys.has("gallery")) {
    pushSlot("gallery", "gallery.heading", "section-heading", model.gallery.heading);
    pushSlot("gallery", "gallery.body", "section-body", model.gallery.body);
    for (const [index, item] of (model.gallery.items ?? []).entries()) {
      pushSlot("gallery", `gallery.items.${index}.title`, "card-title", item.title);
      pushSlot("gallery", `gallery.items.${index}.body`, "card-body", item.body);
    }
  }

  if (visibleSectionKeys.has("faq")) {
    pushSlot("faq", "faq.heading", "section-heading", model.faq.heading);
    for (const [index, item] of (model.faq.faqItems ?? []).entries()) {
      pushSlot("faq", `faq.items.${index}.question`, "faq-question", item.question);
      pushSlot("faq", `faq.items.${index}.answer`, "faq-answer", item.answer);
    }
  }

  if (visibleSectionKeys.has("contact")) {
    pushSlot("contact", "contact.heading", "section-heading", model.contact.heading);
    pushSlot("contact", "contact.body", "section-body", model.contact.body);
    pushSlot(
      "contact",
      "contact.cta.label",
      "primary-cta-label",
      model.contact.cta?.label ?? model.primaryCtaLabel
    );
    pushSlot(
      "contact",
      "contact.cta.secondary.label",
      "secondary-cta-label",
      model.secondaryCtaLabel
    );
    pushSlot(
      "contact",
      "contact.phone",
      "contact-detail",
      model.contactDetails.phone
    );
    pushSlot(
      "contact",
      "contact.email",
      "contact-detail",
      model.contactDetails.email
    );
  }

  return inventory;
}

export function buildTemplateCopyInventory(
  input: TemplateCopyInventoryInput
): TemplateCopySlot[] {
  if (input.renderer === "blue-collar") {
    return collectBlueCollarInventory(input);
  }

  return collectHealthWellnessInventory(input);
}
