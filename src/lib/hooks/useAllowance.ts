import { permit2Address } from "@defi.org/web3-candies";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Token } from "..";
import { useMainContext } from "../provider";
import BN from "bignumber.js";
import { useDebounce } from "./useDebounce";
import { useContractCallback } from "./useContractCallback";
import { QUERY_KEYS } from "lib/config/consts";

const useApproved = (fromToken?: Token) => {
  const { account } = useMainContext();
  const getContract = useContractCallback();
  return useCallback(
    async (srcAmount: string) => {
      try {
        if (!account || !fromToken || !srcAmount) {
          return false;
        }
        const fromTokenContract = getContract(fromToken?.address);
        const allowance = await fromTokenContract?.methods
          ?.allowance(account, permit2Address)
          .call();

        return BN(allowance?.toString() || "0").gte(srcAmount);
      } catch (error) {
        console.log({ error }, "approved error");

        return false;
      }
    },
    [account, fromToken?.address, getContract]
  );
};


export const useAllowance = (fromToken?: Token, fromAmount?: string) => {
  const debouncedFromAmount = useDebounce(fromAmount, 400);
  const isApproved = useApproved(fromToken);
  const { account, chainId } = useMainContext();
  return useQuery({
    queryKey: [
      QUERY_KEYS.APPROVE,
      account,
      chainId,
      fromToken?.address,
      fromAmount,
    ],
    queryFn: async () => {
      console.log(fromToken,fromAmount,  debouncedFromAmount, "fromToken, debouncedFromAmount");
      
      if (!fromToken || !debouncedFromAmount || debouncedFromAmount === "0")
        return false;
      const approved = await isApproved(debouncedFromAmount);
      return approved;
    },
    enabled:
      !!fromToken &&
      !!account &&
      !!chainId &&
      !!debouncedFromAmount && 
      debouncedFromAmount !== "0"
      ,
    staleTime: Infinity,
  });
};
