import { formatMoney } from "@/lib/format";
import { discountListPrice } from "@/lib/pricing";

type SlotPriceProps = {
  priceAmount: number;
  listPrice?: number | null;
  currency: string;
  size?: "card" | "detail" | "inline";
};

export function SlotPrice({
  priceAmount,
  listPrice,
  currency,
  size = "card",
}: SlotPriceProps) {
  const ordinary = discountListPrice(listPrice, priceAmount);
  const selling = formatMoney(priceAmount, currency);

  if (ordinary == null) {
    const plain =
      size === "detail"
        ? "mt-2 font-serif text-4xl text-clay"
        : size === "inline"
          ? "text-clay"
          : "mt-4 font-serif text-2xl text-clay";
    return <p className={plain}>{selling}</p>;
  }

  const ordinaryLabel = `Ordinær pris ${formatMoney(ordinary, currency)}`;
  const sellingLabel = `Rabattert pris ${selling}`;

  if (size === "inline") {
    return (
      <p className="mt-1">
        <span className="mr-2 rounded-full bg-clay px-2 py-0.5 text-xs font-medium text-white">
          Rabatt
        </span>
        <span className="text-sm text-muted line-through">{ordinaryLabel}</span>
        <span className="ml-2 font-medium text-clay">{sellingLabel}</span>
      </p>
    );
  }

  const sellingClass =
    size === "detail"
      ? "mt-1 inline-block rounded-md bg-clay/10 px-2 py-1 font-serif text-4xl text-clay"
      : "mt-1 inline-block rounded-md bg-clay/10 px-2 py-1 font-serif text-2xl text-clay";

  return (
    <div className={size === "card" ? "mt-4" : "mt-2"}>
      <span className="inline-block rounded-full bg-clay px-2 py-0.5 text-xs font-medium tracking-wide text-white">
        Rabatt
      </span>
      <p className="mt-2 text-sm text-muted line-through">{ordinaryLabel}</p>
      <p className={sellingClass}>{sellingLabel}</p>
    </div>
  );
}
