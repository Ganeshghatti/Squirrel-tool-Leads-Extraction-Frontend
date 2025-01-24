"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { ExternalLink, Phone, Mail, MapPin } from "lucide-react"
import axiosInstance from "@/lib/axiosInstance"

interface Lead {
  _id: string
  title: string
  description: string
  phone: string[]
  email: string[]
  website: string
  address: string
  maplink: string
  createdAt: string
}

interface LeadCollectionTableProps {
  leads: Lead[]
  id: string
}

const ClickableLink = ({ href, children }: { href?: string | null; children: React.ReactNode }) => {
  if (!href) return <>{children}</>

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline inline-flex items-center gap-1"
    >
      {children}
  
    </Link>
  )
}

export default function LeadCollectionTable({ leads, id }: LeadCollectionTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const handleFetchEmails = async () => {
    try {
      await axiosInstance.post(`/emailextract/collection/${id}`)

      console.log("Emails fetched successfully")
    } catch (error) {
      console.error("Error fetching emails:", error)

    }
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <Button onClick={handleFetchEmails} className="bg-blue-600 text-white hover:bg-blue-700">
          Fetch Emails
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="p-3 text-left !w-[50px]">Title</TableHead>
              <TableHead className="p-3 text-left w-[50px]">Description</TableHead>
              <TableHead className="p-3 text-left w-[50px]">Phone</TableHead>
              <TableHead className="p-3 text-left w-[50px]">Email</TableHead>
              <TableHead className="p-3 text-left w-[50px]">Website</TableHead>
              <TableHead className="p-3 text-left w-[50px]">Address</TableHead>
              <TableHead className="p-3 text-left w-[50px]">Created At</TableHead>
              <TableHead className="p-3 text-left w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead._id} className="hover:bg-gray-50 border-b">
                <TableCell className="p-3 align-top">{lead.title}</TableCell>
                <TableCell className="p-3 align-top">
                  <span className="line-clamp-2">{lead.description}</span>
                </TableCell>
                <TableCell className="p-3 align-top">
                  {lead.phone[0] && (
                    <ClickableLink href={`tel:${lead.phone[0]}`}>
                      <Phone size={12} /> {lead.phone[0]}
                    </ClickableLink>
                  )}
                </TableCell>
                <TableCell className="p-3 align-top">
                  {lead.email[0] && (
                    <ClickableLink href={`mailto:${lead.email[0]}`}>
                      <Mail size={12} /> {lead.email[0]}
                    </ClickableLink>
                  )}
                  {lead.email.length > 1 && (
                    <div>
                      <Button
                        variant="link"
                        className="p-0 text-blue-600 hover:underline"
                        onClick={() => setSelectedLead(lead)}
                      >
                        View More
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell className="p-3 align-top">
                  {lead.website && (
                    <ClickableLink href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}>
                      {lead.website}
                    </ClickableLink>
                  )}
                </TableCell>
                <TableCell className="p-3 align-top">
                  {lead.maplink && (
                    <ClickableLink href={lead.maplink}>
                      <MapPin size={12} /> {lead.address}
                    </ClickableLink>
                  )}
                </TableCell>
                <TableCell className="p-3 align-top">{new Date(lead.createdAt).toLocaleString()}</TableCell>
                <TableCell className="p-3 align-top">
                  <Button variant="outline" className="hover:bg-gray-100" onClick={() => setSelectedLead(lead)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedLead.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-2 overflow-y-auto h-[400px]">
                <div>
                  <h3 className="font-semibold">Description:</h3>
                  <p>{selectedLead.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Phone Numbers:</h3>
                  <ul className="list-disc pl-5">
                    {selectedLead.phone.map((phone, index) => (
                      <li key={index}>
                        <ClickableLink href={`tel:${phone}`}>
                          <Phone size={12} /> {phone}
                        </ClickableLink>
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedLead.email.length > 1 && (
                  <div>
                    <h3 className="font-semibold">All Emails:</h3>
                    <ul className="list-disc pl-5">
                      {selectedLead.email.map((email, index) => (
                        <li key={index}>
                          <ClickableLink href={`mailto:${email}`}>
                            <Mail size={12} /> {email}
                          </ClickableLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">Website:</h3>
                  <ClickableLink
                    href={
                      selectedLead.website.startsWith("http") ? selectedLead.website : `https://${selectedLead.website}`
                    }
                  >
                    {selectedLead.website}
                  </ClickableLink>
                </div>
                <div>
                  <h3 className="font-semibold">Address:</h3>
                  <ClickableLink href={selectedLead.maplink}>
                    <MapPin size={12} /> {selectedLead.address}
                  </ClickableLink>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

