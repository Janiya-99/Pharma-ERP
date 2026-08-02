const Checkbox = (props: {
  extra?: string;
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
  [x: string]: any;
}) => {
  const { extra, color, ...rest } = props;
  return (
    <input
      type="checkbox"
      className={`defaultCheckbox duration-[0.2s] relative flex h-[20px] min-h-[20px] w-[20px] min-w-[20px] appearance-none 
      items-center justify-center rounded-md border border-gray-300 text-white/0 outline-none transition
      checked:border-none checked:text-white hover:cursor-pointer  ${
        color === "red"
          ? "checked:border-none checked:bg-red-500 "
          : color === "blue"
          ? "checked:border-none checked:bg-indigo-500 "
          : color === "green"
          ? "checked:border-none checked:bg-green-500 "
          : color === "yellow"
          ? "checked:border-none checked:bg-yellow-500 "
          : color === "orange"
          ? "checked:border-none checked:bg-orange-500 "
          : color === "teal"
          ? "checked:border-none checked:bg-teal-500 "
          : color === "navy"
          ? "checked:border-none checked:bg-navy-500 "
          : color === "lime"
          ? "checked:border-none checked:bg-lime-500 "
          : color === "cyan"
          ? "checked:border-none checked:bg-cyan-500 "
          : color === "pink"
          ? "checked:border-none checked:bg-pink-500 "
          : color === "purple"
          ? "checked:border-none checked:bg-purple-500 "
          : color === "amber"
          ? "checked:border-none checked:bg-amber-500 "
          : color === "indigo"
          ? "checked:border-none checked:bg-indigo-500 "
          : color === "gray"
          ? "checked:border-none checked:bg-gray-500 "
          : "checked:bg-brand-500 "
      } ${extra}`}
      name="weekly"
      {...rest}
    />
  );
};

export default Checkbox;
