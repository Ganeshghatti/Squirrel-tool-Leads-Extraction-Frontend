import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-screen">{children}</div>;
};

export default layout;
