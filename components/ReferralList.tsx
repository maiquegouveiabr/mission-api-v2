import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function ReferralList({ children }: Props) {
  return <ol className="list-decimal list-outside pl-12 pt-5 pb-5 flex flex-col gap-5">{children}</ol>;
}

export default ReferralList;
