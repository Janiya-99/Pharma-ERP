import { Popover, PopoverTrigger, PopoverContent } from "@chakra-ui/popover";
const PopoverHorizon = (props: {
  trigger: JSX.Element;
  extra?: string;
  content: JSX.Element;
}) => {
  const { extra, trigger, content } = props;
  return (
    <Popover>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent
        className={`w-max rounded-xl bg-white px-4 py-3 text-sm shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none ${extra}`}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
};

export default PopoverHorizon;
