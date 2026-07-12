const Radio = (props: {
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
  id: string;
  [x: string]: any;
}) => {
  const { color, id, name, ...rest } = props;
  return (
    <input
      id={id}
      name={name}
      type="radio"
      className={`before:contet[""] duration-[0.2s] before:duration-[0.2s] relative h-5 w-5 cursor-pointer
       appearance-none rounded-full border !border-gray-300 transition-all before:absolute
       before:left-[50%] before:top-[3px] before:h-3 before:w-3 before:translate-x-[-50%] before:rounded-full before:transition-all 
       ${
         color === "red"
           ? "checked:!border-red-500 checked:before:!bg-red-500  "
           : color === "blue"
           ? "checked:!border-indigo-500 checked:before:!bg-indigo-500  "
           : color === "green"
           ? "checked:!border-green-500 checked:before:!bg-green-500  "
           : color === "yellow"
           ? "checked:!border-yellow-500 checked:before:!bg-yellow-500  "
           : color === "orange"
           ? "checked:!border-orange-500 checked:before:!bg-orange-500  "
           : color === "teal"
           ? "checked:!border-teal-500 checked:before:!bg-teal-500  "
           : color === "navy"
           ? "checked:!border-navy-500 checked:before:!bg-navy-500  "
           : color === "lime"
           ? "checked:!border-lime-500 checked:before:!bg-lime-500  "
           : color === "cyan"
           ? "checked:!border-cyan-500 checked:before:!bg-cyan-500  "
           : color === "pink"
           ? "checked:!border-pink-500 checked:before:!bg-pink-500  "
           : color === "purple"
           ? "checked:!border-purple-500 checked:before:!bg-purple-500  "
           : color === "amber"
           ? "checked:!border-amber-500 checked:before:!bg-amber-500  "
           : color === "indigo"
           ? "checked:!border-indigo-500 checked:before:!bg-indigo-500  "
           : color === "gray"
           ? "checked:!border-gray-500 checked:before:!bg-gray-500  "
           : "checked:!border-brand-500 checked:before:!bg-brand-500  "
       } `}
      {...rest}
    />
  );
};

export default Radio;
