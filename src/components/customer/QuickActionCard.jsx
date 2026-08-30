function QuickActionCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
    >
      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-5 text-gray-500">
            {description}
          </p>
        </div>

      </div>
    </button>
  )
}

export default QuickActionCard