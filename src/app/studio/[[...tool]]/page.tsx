import { Studio } from './Studio'

// Ensure studio route is not statically generated
export const dynamic = 'force-dynamic'

export default function StudioPage() {
    return <Studio />
}
