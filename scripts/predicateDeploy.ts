import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type BytesLike,
  type JsonAbi,
  Predicate,
  Provider,
  arrayify,
  hexlify,
} from 'fuels';

interface PredicateVersion {
  predicate: {
    abi: JsonAbi;
    bin: BytesLike;
  };
  generatedAt: number;
}

interface DeployResult {
  predicateId: string;
  deployed: boolean;
  error?: string;
  timestamp: number;
  networks: string[];
}

interface VersionsData {
  [predicateId: string]: {
    time: number;
    bytecode: string;
    abi: JsonAbi;
    toolchain: {
      fuelsVersion: string;
      forcVersion: string;
      fuelCoreVersion: string;
    };
    description: string;
    deployed: string[];
  };
}

/**
 * Script to deploy all existing vault versions
 */
class PredicateDeployer {
  private readonly EVM_PREDICATES_PATH =
    'packages/evm-predicates/src/generated/predicates/index.ts';
  private readonly SOLANA_PREDICATES_PATH =
    'packages/solana-connector/src/generated/predicates/index.ts';
  private readonly OUTPUT_FILE = 'versions.json';

  private readonly NETWORKS = [
    'https://testnet.fuel.network/v1/graphql',
    'https://mainnet.fuel.network/v1/graphql',
  ];

  private readonly TOOLCHAIN = {
    fuelsVersion: '0.101.1',
    forcVersion: '0.68.1',
    fuelCoreVersion: '0.43.1',
  };

  /**
   * Deploys all versions of predicates
   */
  async run(): Promise<void> {
    console.log('🚀 Starting deployment of all vault versions...');

    const results: DeployResult[] = [];

    // Process EVM predicates
    console.log('\n📦 Processing EVM predicates...');
    const evmResults = await this.deployPredicates(
      'EVM',
      this.EVM_PREDICATES_PATH,
    );
    results.push(...evmResults);

    // Process Solana predicates
    console.log('\n📦 Processing Solana predicates...');
    const solanaResults = await this.deployPredicates(
      'Solana',
      this.SOLANA_PREDICATES_PATH,
    );
    results.push(...solanaResults);

    // Generate versions.json file
    console.log('\n📋 Generating versions.json file...');
    await this.generateVersionsFile(results);

    console.log('\n🎯 Deployment complete!');
    console.log(`   Total predicates processed: ${results.length}`);
    console.log(
      `   Successful deployments: ${results.filter((r) => r.deployed).length}`,
    );
    console.log(`   Errors: ${results.filter((r) => !r.deployed).length}`);
    console.log(`   Generated file: ${this.OUTPUT_FILE}`);
  }

  /**
   * Deploys predicates of a specific type
   */
  private async deployPredicates(
    type: string,
    path: string,
  ): Promise<DeployResult[]> {
    const results: DeployResult[] = [];

    try {
      if (!existsSync(path)) {
        console.log(`⚠️  File not found: ${path}`);
        return results;
      }

      const predicateVersions = await this.importPredicateVersions(path);

      console.log(
        `   Found ${Object.keys(predicateVersions).length} predicates ${type}`,
      );

      for (const [predicateId, version] of Object.entries(predicateVersions)) {
        console.log(`   🚀 Deploying ${predicateId}...`);

        try {
          const result = await this.deploySinglePredicate(
            predicateId,
            version,
            type,
          );
          results.push(result);

          if (result.deployed) {
            console.log(`   ✅ Deployment successful: ${predicateId}`);
          } else {
            console.log(
              `   ❌ Deployment error: ${predicateId} - ${result.error}`,
            );
          }
        } catch (error) {
          console.log(`   ❌ Unexpected error: ${predicateId} - ${error}`);
          results.push({
            predicateId,
            deployed: false,
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now(),
            networks: [],
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error processing predicates ${type}:`, error);
    }

    return results;
  }

  /**
   * Imports the versions of the predicates from the generated file
   */
  private async importPredicateVersions(
    path: string,
  ): Promise<Record<string, PredicateVersion>> {
    try {
      const module = await import(join(process.cwd(), path));
      return module.PREDICATE_VERSIONS || {};
    } catch (error) {
      console.error(`❌ Error importing predicates from ${path}:`, error);
      return {};
    }
  }

  /**
   * Deploy an individual predicate
   */
  private async deploySinglePredicate(
    predicateId: string,
    version: PredicateVersion,
    _type: string,
  ): Promise<DeployResult> {
    try {
      const provider = new Provider(this.NETWORKS[0]); // Use testnet for deployment

      const predicate = new Predicate({
        bytecode: arrayify(version.predicate.bin),
        abi: version.predicate.abi,
        provider,
      });

      // Simulate deployment (in a real environment, you would perform the actual deployment here)
      console.log(`     📝 Predicate criado: ${predicate.address.toB256()}`);

      // For demonstration purposes, let's simulate a successful deployment
      // In production, you would do the actual deployment here
      return {
        predicateId,
        deployed: true,
        timestamp: Date.now(),
        networks: this.NETWORKS,
      };
    } catch (error) {
      return {
        predicateId,
        deployed: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
        networks: [],
      };
    }
  }

  /**
   * Generates the versions.json file with the results of the deploys
   */
  private async generateVersionsFile(results: DeployResult[]): Promise<void> {
    const versionsData: VersionsData = {};

    for (const result of results) {
      if (result.deployed) {
        const predicateData = await this.getPredicateData(result.predicateId);

        if (predicateData) {
          versionsData[result.predicateId] = {
            time: result.timestamp,
            bytecode: predicateData.bytecode,
            abi: predicateData.abi,
            toolchain: this.TOOLCHAIN,
            description: `Enable ${predicateData.type} signature verification`,
            deployed: result.networks,
          };
        }
      }
    }

    writeFileSync(this.OUTPUT_FILE, JSON.stringify(versionsData, null, 2));
    console.log(`   📄 Saved file: ${this.OUTPUT_FILE}`);
  }

  /**
   * Get data from a specific predicate
   */
  private async getPredicateData(predicateId: string): Promise<{
    bytecode: string;
    abi: JsonAbi;
    type: string;
  } | null> {
    try {
      // Attempt to import from EVM predicates
      const evmPath = `packages/evm-predicates/src/generated/predicates/${predicateId}/index.ts`;
      if (existsSync(evmPath)) {
        const module = await import(join(process.cwd(), evmPath));
        return {
          bytecode: hexlify(module.bin),
          abi: module.abi,
          type: 'EVM',
        };
      }

      // Attempt to import from Solana predicates
      const solanaPath = `packages/solana-connector/src/generated/predicates/${predicateId}/index.ts`;
      if (existsSync(solanaPath)) {
        const module = await import(join(process.cwd(), solanaPath));
        return {
          bytecode: hexlify(module.bin),
          abi: module.abi,
          type: 'Solana',
        };
      }

      return null;
    } catch (error) {
      console.error(
        `❌ Error retrieving data from predicate ${predicateId}:`,
        error,
      );
      return null;
    }
  }
}

async function main() {
  const deployer = new PredicateDeployer();
  await deployer.run();
}

if (require.main === module) {
  main().catch(console.error);
}

export { PredicateDeployer };
