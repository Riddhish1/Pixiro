'use client'
import { usePathname, useRouter } from 'next/navigation'
import PurpleIcon from '../PurpleIcon'
import LightningIcon from '@/icons/LightningIcon'
import CreateWebinarButton from '../CreateWebinar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AiAgents, User } from '../../../../prisma/generated/client'
import { Stripe } from 'stripe'

type Props = {
  assistants: AiAgents[] | []
  user: User
  stripeProducts: Stripe.Product[] | []
}

const Header = ({ assistants, stripeProducts }: Props) => {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="w-full p-4 sticky top-5 z-10 flex justify-between items-center flex-wrap gap-4 border border-border/40 backdrop-blur-2xl rounded-full">
      {pathname?.includes('pipeline') ? (
        <Button
          className="bg-primary/10 border border-border rounded-xl"
          variant="outline"
          onClick={() => router.push('/webinars')}
        >
          <ArrowLeft /> Back to Webinars
        </Button>
      ) : (
        <div className="px-4 py-2 flex justify-center text-bold items-center rounded-xl bg-background border border-border text-primary capitalize">
          {pathname.split('/')[1]}
        </div>
      )}

      <div className="flex gap-6 items-center flex-wrap">
        <PurpleIcon>
          <LightningIcon />
        </PurpleIcon>
        <CreateWebinarButton
          assistants={assistants}
          stripeProducts={stripeProducts}
        />
      </div>
    </div>
  )
}

export default Header
