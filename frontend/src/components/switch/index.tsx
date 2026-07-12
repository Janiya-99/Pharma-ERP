const Switch = (props: {
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
      className={`duration-[0.5s] relative h-5 w-10 appearance-none rounded-[20px] bg-[#e0e5f2] outline-none transition 
      before:absolute before:top-[50%] before:h-4 before:w-4 before:translate-x-[2px] before:translate-y-[-50%] before:rounded-[20px]
      before:bg-white before:shadow-[0_2px_5px_rgba(0,_0,_0,_.2)] before:transition before:content-[""]
      checked:before:translate-x-[22px] hover:cursor-pointer
       ${
        color === "red"
          ? "checked:bg-red-500 "
          : color === "blue"
          ? "checked:bg-indigo-500 "
          : color === "green"
          ? "checked:bg-green-500 "
          : color === "yellow"
          ? "checked:bg-yellow-500 "
          : color === "orange"
          ? "checked:bg-orange-500 "
          : color === "teal"
          ? "checked:bg-teal-500 "
          : color === "navy"
          ? "checked:bg-navy-500 "
          : color === "lime"
          ? "checked:bg-lime-500 "
          : color === "cyan"
          ? "checked:bg-cyan-500 "
          : color === "pink"
          ? "checked:bg-pink-500 "
          : color === "purple"
          ? "checked:bg-purple-500 "
          : color === "amber"
          ? "checked:bg-amber-500 "
          : color === "indigo"
          ? "checked:bg-indigo-500 "
          : color === "gray"
          ? "checked:bg-gray-500 "
          : "checked:bg-brand-500 "
      } ${extra}`}
      name="weekly"
      {...rest}
    />
  );
};

export default Switch;
