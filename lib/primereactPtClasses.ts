export const LoginButtonPT = {
  loadingIcon: {
    className: "mr-1",
  },
};

export const SelectButtonPT = {
  button: {
    className: "!py-2 !rounded-md milestonetoggle",
  },
  label: {
    className: "font-normal",
  },
};

export const SidebarPT = {
  root: {
    className: "dark:!bg-[#121212]",
  },
};

export const AccordionPT = {
  accordiontab: {
    headerAction: {
      className:
        "custom-border-top hover:!border-[#e2e8ff1a] dark:!bg-[#121212] dark:hover:!bg-[#121212] dark:hover:text-white/80 custom-headeraction",
    },
    content: {
      className: "custom-border-bottom dark:!bg-[#121212]",
    },
  },
};

export const FiltersAccordionTabPT = {
  content: {
    className: `filters-accordion-content h-[calc(100vh-11.25rem)] border-y-0 overflow-hidden transition-all duration-1000 vanishing-shadow`,
  },
  headerTitle: {
    className: "text-zinc-100 font-normal",
  },
};

export const DetailsAccordionTabPT = {
  content: {
    className: `p-0 h-[calc(100vh-11.25rem)] overflow-y-scroll`,
  },
  headerTitle: {
    className: `text-zinc-100 font-medium`,
  },
};

export const YearSelectPT = {
  list: {
    className: "dark:bg-[#1a1a1a]",
  },
  item: ({ context }) => ({
    className: `py-2 hover:!text-white/80 ${
      context.selected ? "!bg-zinc-500" : "hover:!bg-zinc-500 !bg-zinc-800"
    }`,
  }),
  header: {
    className: "py-1 border-0 border-b-0 dark:!bg-zinc-900",
  },
  headerCheckbox: {
    box: {
      className: "hover:!border-zinc-600/50",
    },
    root: {
      className: "hover:!border-zinc-600/50",
    },
  },
  headerCheckboxContainer: {
    className: {
      className: "hover:!border-zinc-600/50",
    },
  },
};

export const OperatorSelectButtonPT = {
  root: {
    className: "flex flex-nowrap",
  },
  button: {
    className: "operator-select",
  },
};

export const ThresholdInputPT = {
  input: {
    root: {
      className: "!py-2 w-full rounded-none rounded-l-md threshold-input",
    },
  },
  incrementButton: {
    className: "border border-l-0 border-b-0 rounded-r-md",
  },
  decrementButton: {
    className: "border border-l-0 border-t-0 rounded-r-md",
  },
};
