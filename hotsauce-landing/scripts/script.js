const b = document.querySelector(".ticket__body");
console.table(
  [...b.children].map((c) => ({
    el: c.className,
    width: Math.round(c.getBoundingClientRect().width),
    left: Math.round(c.getBoundingClientRect().left),
    right: Math.round(c.getBoundingClientRect().right),
  })),
);
console.log(
  "body width:",
  Math.round(b.getBoundingClientRect().width),
  "| info flex-grow:",
  getComputedStyle(b.querySelector(".ticket__info")).flexGrow,
);
