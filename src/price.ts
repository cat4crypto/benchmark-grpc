import BN from "bn.js";
import Decimal from "decimal.js";
// import inspect from 'node:ins'
export const bn2Decimal = (bn: BN) => {
  return new Decimal(bn.toString());
};
export function assert(condition: any, msg: any): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
export function getBasePrice(
  baseAmount: BN,
  quoteAmount: BN,
  baseDecimals: number,
  quoteDecimals: number
): number {
  // return quoteAmount / 10 ** quoteDecimals / (baseAmount / 10 ** baseDecimals);
  /**
   * quoteAmount / 10 ** quoteDecimals / (baseAmount / 10 ** baseDecimals)
   * => (quoteAmount / 10 ** quoteDecimals) * (10 ** baseDecimals) / baseAmount
   * => (quoteAmount/baseAmount) * (10 ** (baseDecimals - quoteDecimals))
   */
  const base = bn2Decimal(baseAmount);
  const quote = bn2Decimal(quoteAmount);
  return quote
    .div(base)
    .mul(new Decimal(10).pow(new Decimal(baseDecimals - quoteDecimals)))
    .toNumber();
}
export function getQuotePrice(
  baseAmount: BN,
  quoteAmount: BN,
  baseDecimals: number,
  quoteDecimals: number
): number {
  return 1 / getBasePrice(baseAmount, quoteAmount, baseDecimals, quoteDecimals);
}
/**
 *
 * @param baseAmount
 * @param quoteAmount
 * @param isBaseSol
 * @returns
 */
export function getMemePrice(
  baseAmount: BN,
  quoteAmount: BN,
  // baseDecimals: number,
  // quoteDecimals: number,
  isBaseSol: boolean
): number {
  if (isBaseSol) {
    //TODO: 确定下是是不是所有的都是这个精度,非PUMPFUN的不是6,要处理
    return getQuotePrice(baseAmount, quoteAmount, 9, 6);
  } else {
    //TODO: 确定下是是不是所有的都是这个精度,非PUMPFUN的不是6,要处理
    return getBasePrice(baseAmount, quoteAmount, 6, 9);
  }
}

export function getPriceWithUiAmount(baseAmount: BN, quoteAmount: BN) {
  const base = bn2Decimal(baseAmount);
  const quote = bn2Decimal(quoteAmount);
  return quote.div(base).toNumber();
}

//TODO:现在decimal是写死的,需要处理
/**
 *
 * @param price : token的价格(不是sol)
 * @param solAmount
 * @returns
 */
export function getTokenAmountByPrice(price: number, solAmount: bigint) {
  //如果价格是0.01,表示1个token的价格是0.01 sol,也就是1sol可以买100个token,那么现在solAmount是lamport,需要转换为token的数量
  return (
    // (quoteAmount / 10 ** 9)/price * 10 ** 6
    //=> quoteAmount/(10**9*price)*10**6
    //=> quoteAmount/(price*10**3)
    BigInt(
      new Decimal(solAmount.toString())
        .div(new Decimal(price).mul(10 ** 3))
        .trunc()
        .toString()
    )
  );
}
/**
 * 通过价格和token数量,计算出需要多少sol
 * @param price : token的价格(不是sol)
 * @param memeAmount
 * @returns
 */
export function getSolAmountByPrice(price: number, memeAmount: bigint) {
  //如果价格是0.01,表示1个token的价格是0.01 sol,
  //memeAmount/10**6 * price * 10**9
  //=> memeAmount * price * 10**3

  return BigInt(
    new Decimal(memeAmount.toString())
      .mul(new Decimal(price))
      .mul(10 ** 3)
      .trunc()
      .toString()
  );
}

/**
 * 通过当前的价格和能接受的最大价格,计算出能买到的最少tokenAmount
 * 等价于:要获得tokenacmount,最多愿意出价solAmount的sol
 * @param : buypriceOnSOl:当前的价格
 * @param solAmount:愿意支付的sol
 * @param maxTargetPrice:愿意支付的最高价格
 * @returns {slippagePct:滑点百分比,tokenAmount:能买到的最少tokenAmount}
 */
export const getSlippagePctByPrice = (
  currentPrice: number,
  maxBuyPrice: number
) => {
  return Math.abs(currentPrice - maxBuyPrice) / currentPrice;
};
export const getSlippagePctByMc = (currnetMc: bigint, targetMc: bigint) => {
  const diff = new Decimal(targetMc.toString())
    .sub(new Decimal(currnetMc.toString()))
    .abs();
  return diff.div(new Decimal(currnetMc.toString())).toNumber();
};
/**
 * 用于购买,根据滑点百分比,计算出能买到的最少tokenAmount
 * @param currentPrice
 * @param solAmount
 * @param slippagePct
 * @returns
 */
export const getMinTokenAmountBySlippagePctAndSolAmount = (
  currentPrice: number,
  solAmount: bigint,
  slippagePct: number
) => {
  const curTokenAmount = getTokenAmountByPrice(currentPrice, solAmount);
  const minTokenAmount = new Decimal(curTokenAmount.toString())
    .mul(new Decimal(1 - slippagePct))
    .trunc()
    .toNumber();
  return BigInt(minTokenAmount.toString());
};
export const getMaxSolAmountBySlippagePctAndTokenAmount = (
  currentPrice: number,
  tokenAmount: bigint,
  slippagePct: number
) => {
  const curSolAmount = getSolAmountByPrice(currentPrice, tokenAmount);
  const maxSolAmount = new Decimal(curSolAmount.toString())
    .mul(new Decimal(1 + slippagePct))
    .trunc()
    .toNumber();
  return BigInt(maxSolAmount.toString());
};

/**
 * 用于出售,根据滑点百分比,计算出能得到的最少sol的数量
 * @param currentPrice
 * @param tokenAmount
 * @param slippagePct
 * @returns
 */
export const getMinSolAmountBySlippagePctAndTokenAmount = (
  currentPrice: number,
  tokenAmount: bigint,
  slippagePct: number
) => {
  const curSolAmount = getSolAmountByPrice(currentPrice, tokenAmount);
  const minSolAmount = new Decimal(curSolAmount.toString())
    .mul(new Decimal(1 - slippagePct))
    .trunc()
    .toNumber();
  return BigInt(minSolAmount.toString());
};

/**
 * totalSupply 包含精度
 * @param mcOnSol :包含精度
 * @param totalSupply :不包含精度
 * @returns
 */
export const getPriceOnSolByMc = (
  mcOnSol: bigint,
  totalSupply: bigint
): number => {
  assert(totalSupply > 0, "totalSupply must be greater than 0");
  assert(typeof mcOnSol === "bigint", "mcOnSol must be a bigint");
  assert(typeof totalSupply === "bigint", "totalSupply must be a bigint");
  return new Decimal(mcOnSol.toString())
    .div(new Decimal(totalSupply.toString()))
    .toNumber();
};

export const getSolMcByUsdMc = (usdMc: number, solPrice: number): bigint => {
  // usdMc = solMc * solPrice
  // return usdMc / solPrice;
  assert(solPrice > 0, "solPrice must be greater than 0");
  assert(usdMc > 0, "usdMc must be greater than 0");
  const solMc = new Decimal(usdMc).div(new Decimal(solPrice)).toNumber();
  return BigInt(solMc.toFixed(0));
};
