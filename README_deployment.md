
# Deploying React Files

A step-by-step guide into deploying react files. Before starting, please make sure that you have succesfully cloned your repository (may that be from GitHub or BitBucket)



## Deployment

To deploy this project, first, create a build file using the following code: 

```bash
  npm run build
```

After doing so, make sure to zip your file before uploading to the designated folder in your cPanel server. 

## cPanel Instructions

Access your cPanel server and proceed to the designated folder under **public_html**. Please follow the instructions below: 
```bash
  1. Upload the build zip file. 
  2. Extract its contents into the folder.
  3. If the folder creates abuild   inside the public_html folder, please access the build folder.
  4. Copy and Paste the contents of the folder to your public_html folder. The contents must be found outside of that build folder. 
```

Complete the deployment by testing your website's url and see if your changes have been made. 

