/**
 * The four ways in for someone who opens an empty product.
 *
 * A blank screen that says "nothing right now" is honest, and a bad first
 * five minutes: the person came here because something is stuck, and an
 * empty product asks them to first work out how to describe it. Each of
 * these goes straight into a walkthrough for one thing they already have
 * in mind. Nothing is recorded until they choose to keep something.
 */
export const FIRST_WIN: { playbookKey: string; label: string }[] = [
  { playbookKey: "make-a-phone-call", label: "A call I keep not making" },
  { playbookKey: "send-the-email", label: "An email I have not written" },
  { playbookKey: "book-and-prepare-for-an-appointment", label: "An appointment to book" },
  { playbookKey: "break-down-something-too-big", label: "Something that feels too big to start" },
];
