import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * SANITY -> NEXT ON-DEMAND REVALIDATION
 * ----------------------------------------------------------------------------
 * Sanity calls this endpoint on publish. It verifies the webhook signature
 * against SANITY_REVALIDATE_SECRET, then revalidates the /lots index and every
 * /lots/[slug] page so new or edited lots appear without a redeploy.
 *
 * Webhook setup (manage.sanity.io -> API -> Webhooks):
 *   URL        https://zoebarbusinessgroup.com/api/revalidate
 *   Dataset    production
 *   Trigger    Create / Update / Delete
 *   Filter     _type == "lot" || _type == "producer" || _type == "cuppingNote"
 *   Projection {_type, "slug": slug.current}
 *   Secret     the value of SANITY_REVALIDATE_SECRET
 *
 * A lot's producers and cupping notes feed the lot projection, so a change to
 * any of the three types can leave the lot pages stale.
 */

type WebhookPayload = { _type?: string; slug?: string };

const RELEVANT = new Set(["lot", "producer", "cuppingNote"]);

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return new NextResponse("Invalid signature", { status: 401 });
    }
    if (!body?._type) {
      return new NextResponse("Missing _type in payload", { status: 400 });
    }
    if (!RELEVANT.has(body._type)) {
      return NextResponse.json({ revalidated: false, reason: `ignored _type ${body._type}` });
    }

    revalidatePath("/lots");
    revalidatePath("/lots/[slug]", "page");

    return NextResponse.json({
      revalidated: true,
      paths: ["/lots", "/lots/[slug]"],
      type: body._type,
      slug: body.slug ?? null,
      now: Date.now(),
    });
  } catch (err) {
    console.error("[revalidate]", err);
    return new NextResponse("Error revalidating", { status: 500 });
  }
}
