<h1 align="center">
  Twilio Signal 2025 Keynote Demo<br>
  Conversation Relay + Azure Foundry
</h1>

<p align="center">
  <img src="docs/demo.gif" alt="Conversation Relay demo" />
</p>

# Twilio Setup

1. Create API key and token and set `.env` file params `TWILIO_API_KEY` and `TWILIO_API_SECRET` respectively
2. Create Sync service and set `TWILIO_SYNC_SVC_SID` in _both_ the `.env` file and the `ui/.env` file
3. In the `.env.example` file, at the end are two mp3 files that need to be uploaded as Twilio assets, and their URLs set respectively
4. Set the `DEFAULT_TWILIO_NUMBER` to a number from your Twilio account that can make outbound calls
5. Set the `DEMO_USER_*` variables to your demo user

# Azure Setup

Most configuration will occur in the Azure AI Foundry or the Azure portal

### Azure

Create an Azure account and login to https://portal.azure.com/

Ensure you have an subscription, the transcript storage service uses Azure AI Search which is not available on the free tier.

The following steps are performed in the UI, these can also be completed by commandline or terraform.

1. In the search bar enter `AI Search` and select the service
2. Create a new service, by pressing the + icon
3. Select your subscription, enter service name e.g. `svc-crelay-search`, choose deployment region
4. Create a new index, called `transcript-store`, use the `<proj>/server/agents/recall/setup/search-schema.json` as the input schema
5. In the `.env` file set the `AZURE_SEARCH_INDEX` to the name of the index just created, e.g. `transcript-store`
6. Also set the `AZURE_SEARCH_ENDPOINT` url to the Search service just created, can be found under Overview on the side menu
7. Lastly, set the `AZURE_ADMIN_KEY`, which can be found under Settings > Keys > Primary Admin Key

### Azure AI Foundry Configuration

Login to Azure AI Foundry

1. Create a new project and give it an awesome name
2. From the Overview page, copy the `API Key` on the first page and set the `FOUNDRY_API_KEY` environment variable
3. Also on the overview page, copy the `Azure AI Foundry project endpoint` and set the `AZURE_CONN_STRING` var
4. Deploy the Open AI GPT 4.1 (or similar) model
5. From Azure OpenAI > Copy the `Azure OpenAI endpoint` and set the `AZURE_LLM_ENDPOINT` var
6. Set the `AZURE_LLM_DEPLOYMENT` to `gpt-4.1` (or whatever model you deployed), can be found under `My assets > Models + Endpoints`
7. From the model catalog, deploy the `text-embedding-3-large` model, set the `EMBED_ENDPOINT` environment variable

### Agent Configuration

Login to Azure AI Foundry

1. Create an agent
2. Copy the agent ID, starting with `asst_` and put it in the `.env` file variable named `UNDERWRITER_AGENT_ID`
3. Copy or edit the prompt from file `<proj>/server/agents/underwriter-agent/instructions.md`
4. Add Agent Action. Copy `<proj>/server/agents/underwriter-agent/tool-manifest.json` into schema of as an `OpenAPI 3.0 specified tool` Action and name it `UnderwriterBrainTool`. Note: Replace `{HOSTNAME}` with your ngrok hostname

## Azure CLI (Local Development on OSX)
Ensure Azure CLI is installed 

OSX
```sh
brew update && brew install azure-cli
```

### Deploying to Fly.io
1. `fly launch` to launch a new app with Fly
2. copy all the `.env` configuration to respective `[env]` variables in `fly.toml`
3. copy secrets to `.env.flysecrets`
4. import the secrets using `fly secrets import < ./.env.flysecrets`
