import Link from "next/link";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16 sm:px-10 lg:px-12">
      <Link
        href="/catalogue"
        className="text-sm font-medium text-neutral-500 hover:text-neutral-950"
      >
        ← Catalogue
      </Link>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div className="aspect-[4/5] rounded-2xl bg-neutral-100" />
        <section className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Product template
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            {title || "Product"}
          </h1>
          <p className="mt-6 max-w-md leading-7 text-neutral-600">
            This dynamic route is ready to receive product content and imagery
            when the catalogue is connected to the future CMS.
          </p>
          <button
            type="button"
            className="mt-10 w-full rounded-full bg-neutral-950 px-6 py-4 text-sm font-medium text-white transition hover:bg-neutral-800 sm:w-fit"
          >
            Primary action
          </button>
        </section>
      </div>
    </main>
  );
}
