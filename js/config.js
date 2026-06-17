// ⚙️ Configuration Supabase
const SUPABASE_CONFIG = {
    URL: 'https://aqkftlmrwstuzugqjuvz.supabase.co',
    KEY: 'sb_publishable_V8cTn9nDCegtzl0H420BxA_8_S6pGLQ'
};

// 🔐 Admin password (IMPORTANT: À sécuriser en production!)
const ADMIN_PASSWORD = 'gamera2024';

// 📊 Classe pour gérer Supabase
class SupabaseClient {
    constructor() {
        this.url = SUPABASE_CONFIG.URL;
        this.key = SUPABASE_CONFIG.KEY;
    }

    async insert(table, data) {
        const url = `${this.url}/rest/v1/${table}`;
        const options = {
            method: 'POST',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`Erreur ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur insertion:', error);
            throw error;
        }
    }

    async select(table) {
        let url = `${this.url}/rest/v1/${table}?order=created_at.desc`;
        const options = {
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`
            }
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`Erreur ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur select:', error);
            throw error;
        }
    }

    async update(table, data, id) {
        const url = `${this.url}/rest/v1/${table}?id=eq.${id}`;
        const options = {
            method: 'PATCH',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`Erreur ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur update:', error);
            throw error;
        }
    }

    async delete(table, id) {
        const url = `${this.url}/rest/v1/${table}?id=eq.${id}`;
        const options = {
            method: 'DELETE',
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Prefer': 'return=representation'
            }
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`Erreur ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Erreur delete:', error);
            throw error;
        }
    }
}

const supabase = new SupabaseClient();