"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ExternalLink, Phone, Mail, MapPin, Loader2 } from "lucide-react"
import axiosInstance from "@/lib/axiosInstance"
import { toast } from "sonner"

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
  fetchLeads: () => void
}

const ClickableLink = ({
  href,
  children,
}: {
  href?: string | null
  children: React.ReactNode
}) => {
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

export default function LeadCollectionTable({ leads, id, fetchLeads }: LeadCollectionTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Single state for form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    phone: [""],
    email: [""],
    website: "",
    address: "",
    maplink: "",
  })

  // Generic handler for form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  // Handle phone and email array inputs
  const handleArrayInputChange = (type: "phone" | "email", index: number, value: string) => {
    setFormData((prev) => {
      const newArray = [...prev[type]]
      newArray[index] = value
      return { ...prev, [type]: newArray }
    })
  }

  const handleFetchEmails = async () => {
    try {
      await axiosInstance.post(`/emailextract/collection/${id}`)
      toast.success("Emails fetched successfully")
    } catch (error) {
      toast.error("Error fetching emails")
    }
  }

  const handleCreateLead = async () => {
    setIsLoading(true)
    try {
      await axiosInstance.post(`/lead/collection/${id}`, formData)

      toast.success("Lead created successfully")
      setIsCreateModalOpen(false)

      // Reset form and fetch updated leads
      setFormData({
        title: "",
        description: "",
        phone: [""],
        email: [""],
        website: "",
        address: "",
        maplink: "",
      })

      // Fetch updated leads
      fetchLeads()
    } catch (error) {
      toast.error("Failed to create lead")
    } finally {
      setIsLoading(false)
    }
  }

  const addPhone = () => {
    setFormData((prev) => ({ ...prev, phone: [...prev.phone, ""] }))
  }

  const addEmail = () => {
    setFormData((prev) => ({ ...prev, email: [...prev.email, ""] }))
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end items-center gap-4">
        <Button onClick={handleFetchEmails} className="bg-blue-600 text-white hover:bg-blue-700">
          Fetch Emails
        </Button>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-700 hover:bg-purple-600">Add New Lead</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl h-[400px] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Title */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-left">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Enter title"
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-left">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Enter description"
                />
              </div>

              {/* Phone */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">Phone</Label>
                <div className="col-span-3 space-y-2">
                  {formData.phone.map((phone, index) => (
                    <Input
                      key={index}
                      value={phone}
                      onChange={(e) => handleArrayInputChange("phone", index, e.target.value)}
                      placeholder="Enter phone number"
                    />
                  ))}
                  <Button type="button" onClick={addPhone} variant="outline" size="sm">
                    Add Phone
                  </Button>
                </div>
              </div>

              {/* Email */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">Email</Label>
                <div className="col-span-3 space-y-2">
                  {formData.email.map((email, index) => (
                    <Input
                      key={index}
                      value={email}
                      onChange={(e) => handleArrayInputChange("email", index, e.target.value)}
                      placeholder="Enter email"
                    />
                  ))}
                  <Button type="button" onClick={addEmail} variant="outline" size="sm">
                    Add Email
                  </Button>
                </div>
              </div>

              {/* Website */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="website" className="text-left">
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Enter website"
                />
              </div>

              {/* Address */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-left">
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Enter address"
                />
              </div>

              {/* Map Link */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maplink" className="text-left">
                  Map Link
                </Label>
                <Input
                  id="maplink"
                  value={formData.maplink}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Enter map link"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateLead}
                //disabled={isLoading || !formData.title}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Lead"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

