"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { parse } from "json2csv";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Loader2,
  Trash2,
  Edit2,
  MoveRight,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

// Interface for Lead
interface Lead {
  _id: string;
  title: string;
  description: string;
  phone: string[];
  email: string[];
  website: string;
  address: string;
  maplink: string;
  createdAt: string;
}

// Props for the LeadCollectionTable component
interface LeadCollectionTableProps {
  leads: Lead[];
  id: string;
  fetchLeads: () => void;
}

// Function to delete the collection
const deleteCollection = async (collectionId: string) => {
  try {
    await axiosInstance.delete(`/leadcollection/delete/${collectionId}`);
    toast.success("Collection deleted successfully");
    return true; // Indicate success
  } catch (error) {
    toast.error("Failed to delete collection");
    return false; // Indicate failure
  }
};

// Clickable link component
const ClickableLink = ({
  href,
  children,
}: {
  href?: string | null;
  children: React.ReactNode;
}) => {
  if (!href) return <>{children}</>;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline inline-flex items-center gap-1"
    >
      {children}
    </Link>
  );
};

// Main component
export default function LeadCollectionTable({
  leads,
  id,
  fetchLeads,
}: LeadCollectionTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  const [emailFormData, setEmailFormData] = useState({
    subject: "",
    optionalBody: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    phone: [""],
    email: [""],
    website: "",
    address: "",
    maplink: "",
  });

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEmailFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleArrayInputChange = (
    type: "phone" | "email",
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const newArray = [...prev[type]];
      newArray[index] = value;
      return { ...prev, [type]: newArray };
    });
  };

  const handleFetchEmails = async () => {
    try {
      await axiosInstance.post(`/emailextract/collection/${id}`);
      toast.success(
        "Emails Search Started, Come back later to see the results!"
      );
    } catch (error) {
      toast.error("Error fetching emails");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    setIsDeletingLead(true);
    try {
      await axiosInstance.delete(`/lead/delete/${leadId}`);
      await fetchLeads();
      toast.success("Lead deleted successfully");
    } catch (error) {
      toast.error("Failed to delete lead");
    } finally {
      setIsDeletingLead(false);
    }
  };

  const handleSendEmails = async () => {
    if (!emailFormData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post(`/outreach/send/${id}`, {
        subject: emailFormData.subject,
        optionalBody: emailFormData.optionalBody,
      });

      toast.success("Emails sent successfully");
      setIsSendEmailModalOpen(false);
      setEmailFormData({
        subject: "",
        optionalBody: "",
      });
    } catch (error) {
      toast.error("Failed to send emails");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.post(`/lead/collection/${id}`, formData);
      toast.success("Lead created successfully");
      setIsCreateModalOpen(false);
      setFormData({
        title: "",
        description: "",
        phone: [""],
        email: [""],
        website: "",
        address: "",
        maplink: "",
      });
      fetchLeads();
    } catch (error) {
      toast.error("Failed to create lead");
    } finally {
      setIsLoading(false);
    }
  };

  const addPhone = () => {
    if (editLead) {
      setEditLead((prev) => ({
        ...prev!,
        phone: [...(prev?.phone || []), ""], // Add an empty string for a new phone number
      }));
    }
  };

  const addEmail = () => {
    if (editLead) {
      setEditLead((prev) => ({
        ...prev!,
        email: [...(prev?.email || []), ""], // Add an empty string for a new email
      }));
    }
  };

  const addPhoneNumber = () => {
    setFormData((prev) => ({ ...prev, phone: [...prev.phone, ""] }));
  };

  const addEmailId = () => {
    setFormData((prev) => ({ ...prev, email: [...prev.email, ""] }));
  };

  const handleDeleteCollection = async () => {
    const success = await deleteCollection(id);
    if (success) {
      fetchLeads(); // Refresh leads after deletion
      window.location.href = "/dashboard"; // Redirect to the dashboard
    }
    setIsDeleteDialogOpen(false); // Close the dialog after deletion
  };

  const handleEditLead = async () => {
    if (!editLead) return;

    try {
      await axiosInstance.put(`/lead/edit/${editLead._id}`, {
        ...editLead,
        phone: editLead.phone || [], // Ensure phone is an array
        email: editLead.email || [], // Ensure email is an array
      });
      toast.success("Lead updated successfully");
      fetchLeads(); // Refresh leads after editing
      setIsEditModalOpen(false); // Close the modal
    } catch (error) {
      toast.error("Failed to update lead");
    }
  };

  const removePhone = (index: number) => {
    setEditLead((prev) => ({
      ...prev!,
      phone: prev!.phone.filter((_, i) => i !== index),
    }));
  };

  const removeEmail = (index: number) => {
    setEditLead((prev) => ({
      ...prev!,
      email: prev!.email.filter((_, i) => i !== index),
    }));
  };

  const exportLeads = () => {
    if (leads.length === 0) {
      toast.error("No leads available to export");
      return;
    }

    const csv = parse(leads);
    console.log(csv);

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "leads.csv");
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center gap-4">
        <Dialog
          open={isSendEmailModalOpen}
          onOpenChange={setIsSendEmailModalOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-500">Send Email</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Send Emails</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-left">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  value={emailFormData.subject}
                  onChange={handleEmailInputChange}
                  className="col-span-3"
                  placeholder="Enter email subject"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="optionalBody" className="text-left">
                  Body
                </Label>
                <Input
                  id="optionalBody"
                  value={emailFormData.optionalBody}
                  onChange={handleEmailInputChange}
                  className="col-span-3"
                  placeholder="Optional email body"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-4">
              <Button
                variant="outline"
                onClick={() => setIsSendEmailModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSendEmails} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  "Send Emails"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-4">
          <Button
            onClick={exportLeads}
            className="bg-transparent text-black border-2 hover:text-white"
          >
            <MoveRight className="mr-2 h-4 w-4" /> Export to CSV
          </Button>
          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-700 hover:bg-red-600"
          >
            Delete Collection
          </Button>
          <Button
            onClick={handleFetchEmails}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Fetch Emails
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-700 hover:bg-purple-600">
                Add New Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl h-[400px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-left">Phone</Label>
                  <div className="col-span-3 space-y-2">
                    {formData.phone.map((phone, index) => (
                      <Input
                        key={index}
                        value={phone}
                        onChange={(e) =>
                          handleArrayInputChange("phone", index, e.target.value)
                        }
                        placeholder="Enter phone number"
                      />
                    ))}
                    <Button
                      type="button"
                      onClick={addPhoneNumber}
                      variant="outline"
                      size="sm"
                    >
                      Add Phone
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-left">Email</Label>
                  <div className="col-span-3 space-y-2">
                    {formData.email.map((email, index) => (
                      <Input
                        key={index}
                        value={email}
                        onChange={(e) =>
                          handleArrayInputChange("email", index, e.target.value)
                        }
                        placeholder="Enter email"
                      />
                    ))}
                    <Button
                      type="button"
                      onClick={addEmailId}
                      variant="outline"
                      size="sm"
                    >
                      Add Email
                    </Button>
                  </div>
                </div>
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
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateLead}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create Lead"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border !rounded-md">
        <Table className="overflow-x-auto">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="p-3 text-left">Title</TableHead>
              <TableHead className="p-3 text-left">Description</TableHead>
              <TableHead className="p-3 text-left">Phone</TableHead>
              <TableHead className="p-3 text-left">Email</TableHead>
              <TableHead className="p-3 text-left">Website</TableHead>
              <TableHead className="p-3 text-left">Address</TableHead>
              <TableHead className="p-3 text-left">Created At</TableHead>
              <TableHead className="p-3 text-left">Actions</TableHead>
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
                  {lead.phone &&
                    lead.phone.map((phoneNumber, index) => (
                      <div key={index}>
                        <ClickableLink href={`tel:${phoneNumber}`}>
                          <Phone size={12} /> {phoneNumber}
                        </ClickableLink>
                        {index < lead.phone.length - 1 && <br />}
                      </div>
                    ))}
                </TableCell>

                <TableCell className="p-3 align-top w-[100px]">
                  {lead.email[0] && (
                    <ClickableLink href={`mailto:${lead.email[0]}`}>
                      <Mail size={12} /> {lead.email[0]}
                    </ClickableLink>
                  )}
                </TableCell>
                <TableCell className="p-3 align-top">
                  {lead.website && (
                    <ClickableLink
                      href={
                        lead.website.startsWith("http")
                          ? lead.website
                          : `https://${lead.website}`
                      }
                    >
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
                <TableCell className="p-3 align-top">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="p-3 align-top">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="hover:bg-gray-100"
                      onClick={() => setSelectedLead(lead)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="hover:bg-gray-100"
                      onClick={() => {
                        setEditLead(lead); // Set the lead to edit
                        setIsEditModalOpen(true); // Open the edit modal
                      }}
                    >
                      <Edit2 size={16} className="text-blue-500" />{" "}
                      {/* Lucide Edit Icon */}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="hover:bg-gray-100">
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Lead</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this lead? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" disabled={isDeletingLead}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteLead(lead._id)}
                            disabled={isDeletingLead}
                          >
                            {isDeletingLead ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      >
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
                      selectedLead.website.startsWith("http")
                        ? selectedLead.website
                        : `https://${selectedLead.website}`
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

      {/* Delete Collection Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this collection? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCollection}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-left">
                Title
              </Label>
              <Input
                id="title"
                value={editLead?.title || ""}
                onChange={(e) =>
                  setEditLead((prev) => ({
                    ...prev!,
                    title: e.target.value,
                  }))
                }
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
                value={editLead?.description || ""}
                onChange={(e) =>
                  setEditLead((prev) => ({
                    ...prev!,
                    description: e.target.value,
                  }))
                }
                className="col-span-3"
                placeholder="Enter description"
              />
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-left">Phone Numbers</Label>
              <div className="col-span-3 space-y-2">
                {editLead?.phone.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={phone}
                      onChange={(e) => {
                        const newPhones = [...(editLead?.phone || [])];
                        newPhones[index] = e.target.value; // Update the specific phone number
                        setEditLead((prev) => ({
                          ...prev!,
                          phone: newPhones, // Update the state with the new phone array
                        }));
                      }}
                      placeholder="Enter phone number"
                    />
                    <Button
                      type="button"
                      onClick={() => removePhone(index)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addPhone}
                  variant="outline"
                  size="sm"
                >
                  Add Phone
                </Button>
              </div>
            </div>

            {/* Email Addresses */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-left">Email Addresses</Label>
              <div className="col-span-3 space-y-2">
                {editLead?.email.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...(editLead?.email || [])];
                        newEmails[index] = e.target.value;
                        setEditLead((prev) => ({
                          ...prev!,
                          email: newEmails,
                        }));
                      }}
                      placeholder="Enter email"
                    />
                    <Button
                      type="button"
                      onClick={() => removeEmail(index)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={addEmail}
                  variant="outline"
                  size="sm"
                >
                  Add Email
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-left">
                Website
              </Label>
              <Input
                id="website"
                value={editLead?.website || ""}
                onChange={(e) =>
                  setEditLead((prev) => ({
                    ...prev!,
                    website: e.target.value,
                  }))
                }
                className="col-span-3"
                placeholder="Enter website"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-left">
                Address
              </Label>
              <Input
                id="address"
                value={editLead?.address || ""}
                onChange={(e) =>
                  setEditLead((prev) => ({
                    ...prev!,
                    address: e.target.value,
                  }))
                }
                className="col-span-3"
                placeholder="Enter Address"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 p-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLead}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
