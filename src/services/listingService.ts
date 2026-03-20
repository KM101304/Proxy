import { getStore } from "@/lib/store";
import { Intent, Listing } from "@/types/domain";

function normalize(value: string) {
  return value.toLowerCase();
}

export const listingService = {
  getAll(): Listing[] {
    return getStore().listings;
  },

  findMatches(intent: Intent): Listing[] {
    const needle = normalize(intent.item);

    return getStore()
      .listings.filter((listing) => {
        const title = normalize(listing.title);
        const location = normalize(listing.location);
        return (
          location.includes(normalize(intent.location)) &&
          needle.split(" ").some((token) => token.length > 3 && title.includes(token))
        );
      })
      .sort((a, b) => {
        const aDelta = Math.abs(a.price - intent.max_price);
        const bDelta = Math.abs(b.price - intent.max_price);
        return aDelta - bDelta || b.age_of_listing - a.age_of_listing;
      });
  },
};
