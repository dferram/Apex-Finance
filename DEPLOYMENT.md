# Azure Deployment Guide for Apex Finance

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables (Required)**
Before deploying to Azure, configure these environment variables in Azure App Service:

```bash
DATABASE_URL=postgresql://user:password@host:5432/apex_finance
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
NODE_ENV=production
```

**How to set in Azure:**
1. Go to Azure Portal → Your App Service
2. Navigate to **Configuration** → **Application settings**
3. Add each variable above as a new application setting
4. Click **Save**

### 2. **Database Setup**
Ensure your PostgreSQL database is accessible from Azure:
- Use Azure Database for PostgreSQL, or
- Configure your database firewall to allow Azure IP ranges
- Run migrations if needed

### 3. **GitHub Secrets (Already Configured)**
The following secrets should be set in your GitHub repository:
- `AZUREAPPSERVICE_CLIENTID_A2D3D31DD94E4B419733BB20DC4DB968`
- `AZUREAPPSERVICE_TENANTID_8F79896D01B44B218A8C39D533F81C2E`
- `AZUREAPPSERVICE_SUBSCRIPTIONID_5485E625A08645EF99050524E9CECEEF`

## 🚀 Deployment Process

### Automatic Deployment (Recommended)
1. Push to `main` branch:
   ```bash
   git add .
   git commit -m "feat: ready for production deployment"
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Install dependencies
   - Run TypeScript checks
   - Run tests
   - Build the Next.js application
   - Deploy to Azure App Service

3. Monitor deployment:
   - Go to GitHub → Actions tab
   - Watch the "Build and deploy Node.js app to Azure Web App" workflow

### Manual Deployment
If needed, trigger deployment manually:
1. Go to GitHub → Actions
2. Select "Build and deploy Node.js app to Azure Web App"
3. Click "Run workflow" → "Run workflow"

## 📋 Post-Deployment Verification

1. **Check Application Status**
   - Visit: `https://apexfinance.azurewebsites.net`
   - Verify the homepage loads correctly

2. **Test Database Connection**
   - Try logging in
   - Create a test transaction
   - Verify data persistence

3. **Monitor Logs**
   - Azure Portal → App Service → Log stream
   - Check for any errors or warnings

4. **Performance Check**
   - Test page load times
   - Verify API endpoints respond correctly

## 🔧 Troubleshooting

### Build Fails
- Check GitHub Actions logs for specific errors
- Verify all dependencies are in `package.json`
- Ensure TypeScript compiles without errors locally

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly in Azure
- Check database firewall rules
- Ensure SSL is configured if required

### Application Won't Start
- Check Azure App Service logs
- Verify Node.js version (22.x) is compatible
- Ensure all environment variables are set

### 500 Internal Server Error
- Check Application Insights or Log Stream
- Verify database migrations are up to date
- Check for missing environment variables

## 📁 Deployment Files

The following files are configured for Azure deployment:

- **`.github/workflows/main_apexfinance.yml`** - GitHub Actions workflow
- **`web.config`** - IIS configuration for Azure
- **`server.js`** - Custom Node.js server for Azure
- **`.deployment`** - Kudu deployment configuration
- **`deploy.sh`** - Deployment script
- **`next.config.mjs`** - Next.js configuration with `output: 'standalone'`

## 🔒 Security Considerations

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use Azure Key Vault** for sensitive secrets (optional but recommended)
3. **Enable HTTPS only** in Azure App Service settings
4. **Configure CORS** if needed for API endpoints
5. **Set up authentication** for production use

## 📊 Monitoring

Set up monitoring in Azure:
1. Enable **Application Insights**
2. Configure **Alerts** for errors and performance
3. Set up **Log Analytics** for detailed logging

## 🔄 Continuous Deployment

The project is configured for continuous deployment:
- Every push to `main` triggers a new deployment
- Tests must pass before deployment
- Build artifacts are cached for faster deployments

## 📞 Support

If you encounter issues:
1. Check Azure App Service diagnostics
2. Review GitHub Actions logs
3. Verify environment variables
4. Check database connectivity

---

**Last Updated:** 2026-05-20
**App Name:** apexfinance
**Region:** Configure in Azure Portal
