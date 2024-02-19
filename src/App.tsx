
import { lazy, Suspense } from "react";

const Dapp = import.meta.env.DEV ?  lazy(() => import("./Dapp")) : undefined;

export const App = () => {
  return (
    <Suspense>
      {Dapp && <Dapp />}
    </Suspense>
  );
};

