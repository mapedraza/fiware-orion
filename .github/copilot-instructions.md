# FIWARE Orion Context Broker Development Instructions

FIWARE Orion Context Broker is a C++ implementation of the NGSIv2 REST API for context management. It allows you to manage the entire lifecycle of context information including updates, queries, registrations and subscriptions.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Quick Start with Docker (RECOMMENDED - 10 seconds)
Use Docker for the fastest development setup:

- Start the full environment: `cd docker && docker compose up -d`
- Test the API: `curl localhost:1026/version`
- Stop: `docker compose down`

### Building from Source (2-3 minutes)
For development requiring source modifications:

**CRITICAL TIMING**: Build takes 2-3 minutes total. NEVER CANCEL builds or long-running commands.

**Install Dependencies (Ubuntu 24.04):**
```bash
# Install build tools and basic dependencies
sudo apt-get update
sudo apt-get install -y make cmake g++ git
sudo apt-get install -y libssl-dev libcurl4-openssl-dev libboost-dev libboost-regex-dev libboost-filesystem-dev libboost-thread-dev uuid-dev libgnutls28-dev libsasl2-dev libgcrypt20-dev

# Install Ubuntu-provided libraries  
sudo apt-get install -y libmicrohttpd-dev libmosquitto-dev libgtest-dev

# Install MongoDB C driver 1.29.0 (from source - takes 1 minute 5 seconds)
wget https://github.com/mongodb/mongo-c-driver/releases/download/1.29.0/mongo-c-driver-1.29.0.tar.gz
tar xfvz mongo-c-driver-1.29.0.tar.gz
cd mongo-c-driver-1.29.0 && mkdir cmake-build && cd cmake-build
cmake -DENABLE_AUTOMATIC_INIT_AND_CLEANUP=OFF ..
make && sudo make install

# Install rapidjson 1.1.0 (headers only - instant)
wget https://github.com/miloyip/rapidjson/archive/v1.1.0.tar.gz
tar xfvz v1.1.0.tar.gz
sudo mv rapidjson-1.1.0/include/rapidjson/ /usr/local/include
```

**Build Orion (takes 51 seconds - NEVER CANCEL):**
```bash
cd fiware-orion
make release                    # Build time: ~51 seconds, NEVER CANCEL, set timeout 10+ minutes
sudo make install             # Install to /usr/bin/contextBroker
contextBroker --version        # Verify installation
```

**Start MongoDB and Test:**
```bash
# Start MongoDB via Docker (fastest)
docker run -d --name mongodb -p 27017:27017 mongo:8.0

# Start Context Broker
contextBroker -dbURI mongodb://localhost -fg -logLevel DEBUG

# Test API (in another terminal)
curl localhost:1026/version
```

## Validation Scenarios

**CRITICAL**: Always test actual functionality after making changes. Execute these real workflows:

**Basic Entity Operations:**
```bash
# Create entity
curl localhost:1026/v2/entities -s -S --header 'Content-Type: application/json' \
    -X POST -d '{"id": "Room1", "type": "Room", "temperature": {"value": 23, "type": "Number"}, "pressure": {"value": 720, "type": "Number"}}'

# Query entity  
curl localhost:1026/v2/entities/Room1 -s -S --header 'Accept: application/json' | python3 -m json.tool

# Update attribute
curl localhost:1026/v2/entities/Room1/attrs/temperature -s -S --header 'Content-Type: application/json' \
    -X PUT -d '{"value": 26.3, "type": "Number"}'

# Verify update
curl localhost:1026/v2/entities/Room1 -s -S --header 'Accept: application/json' | python3 -m json.tool
```

## Testing

**Unit Tests (15+ minutes - NEVER CANCEL):**
```bash
make unit_test                  # NEVER CANCEL, set timeout 30+ minutes
```

**Functional Tests (45+ minutes - NEVER CANCEL):**
```bash
# Set up test environment
mkdir ~/bin
export PATH=~/bin:$PATH
make install_scripts INSTALL_DIR=~
. scripts/testEnv.sh
python3 -m venv /opt/ft_env
. /opt/ft_env/bin/activate
pip install Flask==2.0.2 Werkzeug==2.0.2 paho-mqtt==1.6.1 amqtt==0.11.0b1

# Run functional tests - NEVER CANCEL, set timeout 60+ minutes
make functional_test INSTALL_DIR=~    # Expected time: 45+ minutes
```

## CI/CD Integration

**Style and Linting:**
```bash
# Always run before committing
scripts/style_check.sh          # Code style validation
make lint_changed               # Lint only changed files
```

**Build Validation:**
- `make release` - Production build (51 seconds)
- `make debug` - Debug build  
- `make clean` - Clean all build artifacts

## Common Issues and Troubleshooting

**Build Dependencies:**
- Network issues may prevent dependency downloads - use Docker approach instead
- Ubuntu package versions differ from Debian 12 reference - the CMakeLists.txt has been modified to use shared mosquitto library instead of static
- Google Test/Mock available via `libgtest-dev` package

**Runtime Issues:**
- MongoDB must be running before starting Context Broker
- Default database name is "orion" 
- Default port is 1026
- Check MongoDB connection with: `docker ps --filter name=mongodb`

**Performance Notes:**
- Docker startup: ~10 seconds
- Source build: ~51 seconds (with dependencies: 2-3 minutes)  
- Unit tests: 15+ minutes
- Functional tests: 45+ minutes

## Key Directories

- `src/app/contextBroker/` - Main application
- `src/lib/` - Core libraries (common, ngsi, rest, mongoBackend, etc.)
- `test/functionalTest/` - Functional test suite
- `test/unittests/` - Unit test suite  
- `docker/` - Docker and Docker Compose configuration
- `scripts/` - Build and utility scripts

## Development Workflow

1. **Always start with Docker for quick testing**: `cd docker && docker compose up -d`
2. **For source changes**: Build with `make release` (51 seconds)
3. **Always validate with real API calls** using the validation scenarios above
4. **Run style checks**: `scripts/style_check.sh` before committing
5. **For thorough testing**: Run unit tests (15+ minutes) and functional tests (45+ minutes) with appropriate timeouts

## Critical Reminders

- **NEVER CANCEL builds or tests** - they may take 45+ minutes but will complete
- **Always set timeouts of 60+ minutes** for build commands and tests  
- **Always validate with actual API operations** - don't just check if the process starts
- **Use Docker for fastest development** - source builds are for when you need to modify C++ code
- **MongoDB is required** - start it before the Context Broker
- **The CMakeLists.txt has been modified** to work with Ubuntu packages instead of building mosquitto from source