"use client";

import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { parse } from "json2csv";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Loader2, MinusCircle, MoveRight } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import Link from "next/link";
import { toast } from "sonner";

interface Lead {
  title: string;
  description: string;
  category: string;
  location: string;
  createdAt: string;
  _id: string;
  outreach: any[];
  __v: number;
}

export function LeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Single state for form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
  });

  // Generic handler for form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Fetch leads from the API
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/leadcollection/all");
      const { success, leadCollection } = response.data;
      console.log(response.data.leadCollection);
      console.log(response.data);
      if (success) {
        setLeads(leadCollection.reverse());
      } else {
        toast.error("Failed to fetch leads");
      }
    } catch (error: any) {
      toast.error("Error fetching leads");
    } finally {
      setIsLoading(false);
    }
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

  // Create new lead
  const handleCreateLead = async () => {
    try {
      const response = await axiosInstance.post(
        "/leadcollection/create",
        formData
      );

      if (response.data.success) {
        toast.success("Lead created successfully");
        setIsDialogOpen(false);

        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          location: "",
        });

        // Refresh leads
        fetchLeads();
      } else {
        toast.error("Failed to create lead");
      }
    } catch (error: any) {
      toast.error("Error creating lead");
    }
  };

  // Fetch leads on initial render
  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="!w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads Management</h1>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-700 hover:bg-purple-600">
                Create New Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {["title", "description", "category", "location"].map(
                  (field) => (
                    <div key={field} className="grid grid-cols-4 gap-4">
                      <Label htmlFor={field} className="text-left capitalize">
                        {field}
                      </Label>
                      <Input
                        id={field}
                        value={formData[field as keyof typeof formData]}
                        placeholder={`Enter ${field}`}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                  )
                )}
              </div>
              <div className="flex justify-end space-x-2 p-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLead}
                  disabled={Object.values(formData).some((val) => !val)}
                >
                  Create Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Link href="/dashboard/leads/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Find More Leads
            </Button>
          </Link>
          <Button
            onClick={exportLeads}
            className="bg-transparent text-black border-2 hover:text-white"
          >
            <MoveRight className="mr-2 h-4 w-4" /> Export to CSV
          </Button>
        </div>
      </div>
      {/* Rest of the component remains the same */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : leads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <Link key={lead._id} href={`/dashboard/leads/${lead._id}`}>
              <Card>
                <CardHeader>
                  <CardTitle>{lead.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Description:</strong> {lead.description}
                  </p>
                  <p>
                    <strong>Category:</strong> {lead.category}
                  </p>
                  <p>
                    <strong>Location:</strong> {lead.location}
                  </p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Created at: {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          No leads found. Create some leads to get started!
        </div>
      )}
    </div>
  );
}
