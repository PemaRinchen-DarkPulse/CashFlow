export default function CTABanner() {
  return (
    <section className="py-6 bg-gray-50">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <div className="bg-green-700 rounded-2xl px-6 py-14 md:py-20 text-center relative overflow-hidden">
        {/* subtle texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '24px',
        }} />

        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white max-w-lg mx-auto leading-snug tracking-tight">
            Good healthcare shouldn't depend on your postcode
          </h2>
          <p className="text-green-100 mt-3 max-w-sm mx-auto text-base leading-relaxed">
            Download AiMedicare and get the same connected care whether you're in
            Thimphu or Trashi Yangtse.
          </p>
          <a
            href="#"
            className="inline-block mt-7 bg-white text-green-800 text-base font-semibold px-7 py-3 rounded-lg hover:bg-green-50 transition-colors"
          >
            Download App
          </a>
        </div>
        </div>
      </div>
    </section>
  );
}
