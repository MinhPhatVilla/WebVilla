import { type SchemaTypeDefinition } from 'sanity'

// Import các schema
import property from './schemas/property'
import dailyPricing from './schemas/dailyPricing'
import availability from './schemas/availability'
import booking from './schemas/booking'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [
        property,
        dailyPricing,
        availability,
        booking,
    ],
}
