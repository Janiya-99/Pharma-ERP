const Progress = (props: {
  value: number;
  color?:
    | "red"
    | "blue"
    | "green"
    | "yellow"
    | "orange"
    | "teal"
    | "navy"
    | "lime"
    | "cyan"
    | "pink"
    | "purple"
    | "amber"
    | "indigo"
    | "gray";
  width?: string;
}) => {
  const { value, color, width } = props;
  return (
    <div
      className={`h-2 ${
        width ? width : "w-full"
      } rounded-full bg-gray-200 `}
    >
      <div
        className={`flex h-full items-center justify-center rounded-full ${
          color === "red"
            ? "bg-red-500 "
            : color === "blue"
            ? "bg-indigo-500 "
            : color === "green"
            ? "bg-green-500 "
            : color === "yellow"
            ? "bg-yellow-500 "
            : color === "orange"
            ? "bg-orange-500 "
            : color === "teal"
            ? "bg-teal-500 "
            : color === "navy"
            ? "bg-navy-500 "
            : color === "lime"
            ? "bg-lime-500 "
            : color === "cyan"
            ? "bg-cyan-500 "
            : color === "pink"
            ? "bg-pink-500 "
            : color === "purple"
            ? "bg-purple-500 "
            : color === "amber"
            ? "bg-amber-500 "
            : color === "indigo"
            ? "bg-indigo-500 "
            : color === "gray"
            ? "bg-gray-500 "
            : "bg-brand-500 "
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default Progress;
