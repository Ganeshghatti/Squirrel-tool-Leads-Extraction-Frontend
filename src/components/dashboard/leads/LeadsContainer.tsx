"use client"

import { useState, useEffect } from "react"
import axiosInstance from "@/lib/axiosInstance"
import LeadCollectionTable from "./LeadsTable"

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

interface LeadCollectionResponse {
  success: boolean
  message: string
  count: number
  leads: Lead[]
}

export default function LeadCollectionContainer({ id }: { id: string }) {
  const [data, setData] = useState<LeadCollectionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get<LeadCollectionResponse>(`/leadcollection/${id}`)
        setData(response.data)
      } catch (err) {
        setError("Failed to fetch lead collection data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return <div>No data available</div>

  return <div className="w-fit">
    <LeadCollectionTable leads={data.leads} id={id} />
  </div>
}

