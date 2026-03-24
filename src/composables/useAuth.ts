import { ref, computed } from 'vue'
import { authService } from '../services/authService'

const token = ref<string|null>(localStorage.getItem('access_token'))
const user = ref<any>(null)
const loading = ref(false)
const error = ref('')

function parseJwt (t: string) {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(window.atob(base64));
      console.log('Decoded JWT:', decoded); // Debug log to see what's in the token
      return decoded;
    } catch (e) {
      return null;
    }
}

if (token.value) {
    user.value = parseJwt(token.value);
}

export function useAuth(){
  const isAuthenticated = computed(()=>!!token.value)

  const login = async (payload:any)=>{
    loading.value = true
    error.value = ''
    try{
      const res = await authService.login(payload)
      localStorage.setItem('access_token', res.accessToken)
      localStorage.setItem('refresh_token', res.refreshToken)
      token.value = res.accessToken
      user.value = parseJwt(res.accessToken)

      if (res.mustChangePassword) {
        localStorage.setItem('must_change_password', 'true')
      } else {
        localStorage.removeItem('must_change_password')
      }
    }catch(e:any){
      error.value = e.response?.data?.message || e.message || 'Error occurred'
      throw e
    }finally{
      loading.value = false
    }
  }

  const logout = async ()=>{
    await authService.logout()
    token.value = null
    user.value = null
  }

  return { token, user, loading, error, isAuthenticated, login, logout }
}