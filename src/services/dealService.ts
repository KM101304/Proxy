import { roundCurrency } from "@/lib/utils";
import { Deal } from "@/types/domain";

export const dealService = {
  calculateFee(askingPrice: number, finalPrice: number) {
    const savings = roundCurrency(Math.max(0, askingPrice - finalPrice));
    const transactionFee =
      savings > 0 ? roundCurrency(savings * 0.1) : roundCurrency(finalPrice * 0.02);

    return {
      savings,
      transactionFee,
    };
  },

  updateAcceptedDeal(deal: Deal, askingPrice: number, finalPrice: number): Deal {
    const { savings, transactionFee } = this.calculateFee(askingPrice, finalPrice);

    return {
      ...deal,
      current_offer: finalPrice,
      final_price: finalPrice,
      status: "accepted",
      savings_amount: savings,
      transaction_fee: transactionFee,
      updated_at: new Date().toISOString(),
      acceptance_probability: 1,
    };
  },
};
