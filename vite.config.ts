
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  const rawEnv = loadEnv(mode, process.cwd());
  const envDefines = Object.fromEntries(
    Object.entries(rawEnv)
      .filter(([key]) => key.startsWith('VITE_'))
      .map(([key, val]) => [`import.meta.env.${key}`, JSON.stringify(val)])
  );

  return defineConfig({
    server: {
      host: "::",
      port: 8080,
      hmr: {
        protocol: 'ws',
        clientPort: 8080
      },
    },
    plugins: [
      react(),
      componentTagger(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      ...envDefines,
      // Add non-environment related define entries
      "process.env": JSON.stringify({}),
      "process.env.NODE_ENV": JSON.stringify("production")
    },
    // Build options to better handle service workers
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          }
        }
      }
    }
  });
};
