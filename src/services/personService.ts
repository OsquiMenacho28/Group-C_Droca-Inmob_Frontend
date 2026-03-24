import { api } from './api'

export const personService = {
  async getPersonByAuthUserId(authUserId: string) {
    try {
      const response = await api.get(`/persons/by-auth/${authUserId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching person by authUserId:', error)
      throw error
    }
  },

  async createPerson(payload: any) {
    try {
      console.log('Creating person with payload:', payload)
      const response = await api.post('/persons', payload)
      console.log('Person created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating person:', error)
      throw error
    }
  },

  async updatePersonByAuthUserId(authUserId: string, payload: any) {
    try {
      const response = await api.patch(`/persons/by-auth/${authUserId}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating person by authUserId:', error)
      throw error
    }
  },

  async deletePersonByAuthUserId(authUserId: string) {
    try {
      await api.delete(`/persons/by-auth/${authUserId}`)
    } catch (error) {
      console.error('Error deleting person by authUserId:', error)
      throw error
    }
  }
}