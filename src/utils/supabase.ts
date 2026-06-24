import { createClient } from '@supabase/supabase-js';

// Load Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xhikheavlrgpidnxrnpr.supabase.co/';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0rMWELXhxpM7Ms1r0twRWQ_REJ3gDUi';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Custom function to test the connection to Supabase.
 * It checks if we can connect or fetch any data.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // Try to execute a simple query to see if connection works
    const { error } = await supabase.from('sppi_store').select('key').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        // Table doesn't exist yet, but connection was made successfully!
        return { 
          success: true, 
          message: 'Terhubung ke Supabase! (Tabel sppi_store belum diinisialisasi)' 
        };
      }
      return { 
        success: false, 
        message: `Koneksi gagal: ${error.message} (Kode: ${error.code})` 
      };
    }
    return { success: true, message: 'Koneksi ke Supabase aktif dan sinkron!' };
  } catch (err: any) {
    return { success: false, message: `Error koneksi Supabase: ${err?.message || err}` };
  }
}

/**
 * Bulk sync local sppi/fgi keys to Supabase sppi_store table.
 */
export async function syncLocalStorageToSupabase(): Promise<boolean> {
  try {
    const keys = Object.keys(localStorage).filter(
      k => k.startsWith('sppi_') || k.startsWith('fgi_')
    );
    
    if (keys.length === 0) return true;

    const upsertRows = keys.map(key => {
      const val = localStorage.getItem(key);
      let parsedValue = val;
      try {
        if (val) parsedValue = JSON.parse(val);
      } catch (e) {
        // keep as string
      }
      return {
        key,
        value: parsedValue,
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from('sppi_store')
      .upsert(upsertRows, { onConflict: 'key' });

    if (error) {
      console.warn('Upsert to Supabase failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to sync to Supabase:', err);
    return false;
  }
}

/**
 * Fetch all keys from Supabase sppi_store table and load into localStorage.
 */
export async function fetchSupabaseToLocalStorage(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('sppi_store')
      .select('key, value');

    if (error) {
      console.warn('Fetch from Supabase failed:', error);
      return false;
    }

    if (data && data.length > 0) {
      (window as any).__isSyncing = true;
      data.forEach((row: any) => {
        const valStr = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
        localStorage.setItem(row.key, valStr);
      });
      (window as any).__isSyncing = false;
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error fetching Supabase data:', err);
    return false;
  }
}
