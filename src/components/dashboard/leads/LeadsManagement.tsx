"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Loader2 } from "lucide-react"
import axiosInstance from "@/lib/axiosInstance"
import Link from "next/link"

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
  const [isLoading, setIsLoading] = useState(true)

  // Fetch leads from the API
  const fetchLeads = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get("/leadcollection/all")
      const { success, leadCollection } = response.data

      if (success) {
        setLeads(leadCollection) // Update the state with fetched leads
      } else {
        console.error("Failed to fetch leads:", response.data.message)
      }
    } catch (error: any) {
      console.error("Error fetching leads:", error.response?.data || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch leads on initial render
  useEffect(() => {
    fetchLeads()
  }, [])

  return (
    <div className="!w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads Management</h1>
        <Link href="/dashboard/leads/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create More Leads
          </Button>
        </Link>
      </div>
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
        <div className="text-center text-gray-500 mt-8">No leads found. Create some leads to get started!</div>
      )}
    </div>
  )
}

