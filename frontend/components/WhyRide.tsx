export default function WhyRide() {
  const items = [
    {
      title: "Premium bikes",
      description:
        "Comfortable and reliable e-bikes selected for smooth rides around Byron Bay.",
    },
    {
      title: "Simple booking",
      description:
        "A fast and clear booking flow so customers can reserve a bike without confusion.",
    },
    {
      title: "Local experience",
      description:
        "A Byron Bay-based service built for beach rides, town cruising and easy exploring.",
    },
  ];

  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-[#C8BEAA] bg-[#E7E0D0]/40 p-8 md:p-12">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.25em] text-[#7A7468]">
            Why ride with us
          </p>

          <h2 className="mt-3 text-3xl font-extrabold uppercase text-[#1F2933] md:text-5xl">
            Built for easy rides and a clean experience
          </h2>

          <p className="mt-4 text-[#5B6470]">
            Everything is designed to feel simple, premium and local from the
            moment a customer lands on the site.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-[#C8BEAA] bg-[#DDD5C4]/60 p-6"
            >
              <h3 className="text-xl font-bold uppercase text-[#1F2933]">
                {item.title}
              </h3>

              <p className="mt-4 text-sm leading-6 text-[#5B6470]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}