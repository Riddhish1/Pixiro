import LeadIcon from '@/icons/LeadIcon'
import PipelineIcon from '@/icons/PipelineIcon'
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import PageHeader from '@/components/ReusableComponent/PageHeader'
import { Webcam } from 'lucide-react'
import { getLeads } from '@/action/leads'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
      <Users className="w-12 h-12 text-muted-foreground" />
      <div className="text-center">
        <h3 className="text-lg font-semibold">No leads yet</h3>
        <p className="text-sm text-muted-foreground">
          Your leads will appear here once people register for your webinars
        </p>
      </div>
    </div>
  )
}

const page = async () => {
  const response = await getLeads()

  if (response.status === 403) {
    redirect('/sign-in')
  }

  if (response.status !== 200 || !response.leads) {
    return <div>Error loading leads</div>
  }

  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        leftIcon={<Webcam className="w-3 h-3" />}
        mainIcon={<LeadIcon className="w-12 h-12" />}
        rightIcon={<PipelineIcon className="w-3 h-3" />}
        heading="The home to all your customers"
        placeholder="Search customer..."
      />
      {response.leads.length === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-sm text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="text-sm text-muted-foreground">
                Phone
              </TableHead>
              <TableHead className="text-right text-sm text-muted-foreground">
                Tags
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {response.leads?.map((lead, idx) => (
              <TableRow
                key={idx}
                className="border-0"
              >
                <TableCell className="font-medium">{lead?.name}</TableCell>
                <TableCell>{lead?.email}</TableCell>
                <TableCell>{lead?.phone}</TableCell>
                <TableCell className="text-right">
                  {lead?.tags?.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                    >
                      {tag}
                    </Badge>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
export default page
