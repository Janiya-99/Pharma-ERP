function Card(props: {
  variant?: string;
  extra?: string;
  children?: JSX.Element | any[];
  [x: string]: any;
}) {
  const { variant, extra, children, ...rest } = props;
  return (
    <div
      className={`relative flex flex-col rounded-2xl border border-gray-100 bg-white dark:bg-navy-800 dark:border-navy-700 dark:text-white bg-clip-border shadow-[0_8px_30px_rgb(0,0,0,0.015)] ${extra}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
