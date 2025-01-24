"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { CreateLeadModal } from "./CreateLeadModal"
import axiosInstance from "@/lib/axiosInstance"

interface Lead {
  title: string
  description: string
  category: string
  location: string
  createdAt: string
  _id: string
  outreach: any[]
  __v: number
}

export function LeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch leads from the API
  const fetchLeads = async () => {
    try {
      const response = await axiosInstance.get("/leadcollection/all");
      const { success, leadCollection } = response.data;
  
      if (success) {
        setLeads(leadCollection); // Update the state with fetched leads
      } else {
        console.error("Failed to fetch leads:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error fetching leads:", error.response?.data || error.message);
    }
  };

  // Fetch leads on initial render
  useEffect(() => {
    fetchLeads()
  }, [])

  const addNewLead = async (newLead: Omit<Lead, "_id" | "createdAt" | "outreach" | "__v">) => {
    try {
      const response = await axiosInstance.post("/leadcollection/create", newLead);
  
      if (response.status === 201) {
        await fetchLeads(); // Refresh leads after successfully creating a new lead
        setIsModalOpen(false);
      } else {
        console.error("Failed to create lead:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error creating lead:", error.response?.data || error.message);
    }
  };

  return (
    <div className="!w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create More Leads
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <Card key={lead._id}>
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
        ))}
      </div>
      <CreateLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addNewLead}
      />
    </div>
  )
}
