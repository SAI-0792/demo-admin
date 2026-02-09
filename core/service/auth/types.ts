export interface LoginCredentials {
  identity: string
  type: "email" | "phone"
  password: string
}

export interface LoginResponse {
  token: string
  refresh: string
  user: User
  app_version: string
}

// Internal User Interface (used in store)
export interface User {
  id: string
  role_id?: string
  email?: string
  name?: string
  avatar?: string
  modules?: string[]
  outlets?: Outlet[]
  currentOutletId?: string
  phone?: string
}

export interface Outlet {
  id: string
  name: string
  type: string
  userRoleId: string
}

// API Response Types
export interface ApiUser {
  id: string
  fullname: string
  email: string | null
  phone: string | null
  app_version: string
}

export type ProfileResponse = ApiUser

export interface OutletItem {
  business_name: string | null
  outlet_id: string | null
  user_role_id: string
}

export interface OutletResponse {
  msg: string
  data: OutletItem[]
  pagination: any
  error: boolean
  app_version: string
}
