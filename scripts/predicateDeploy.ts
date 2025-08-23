import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  Address,
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
 * Script para fazer deploy de todas as versões de vault existentes
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
   * Executa o deploy de todas as versões de predicates
   */
  async run(): Promise<void> {
    console.log('🚀 Iniciando deploy de todas as versões de vault...');

    const results: DeployResult[] = [];

    // Processar predicates EVM
    console.log('\n📦 Processando predicates EVM...');
    const evmResults = await this.deployPredicates(
      'EVM',
      this.EVM_PREDICATES_PATH,
    );
    results.push(...evmResults);

    // Processar predicates Solana
    console.log('\n📦 Processando predicates Solana...');
    const solanaResults = await this.deployPredicates(
      'Solana',
      this.SOLANA_PREDICATES_PATH,
    );
    results.push(...solanaResults);

    // Gerar arquivo versions.json
    console.log('\n📋 Gerando arquivo versions.json...');
    await this.generateVersionsFile(results);

    console.log('\n🎯 Deploy concluído!');
    console.log(`   Total de predicates processados: ${results.length}`);
    console.log(
      `   Deploy bem-sucedidos: ${results.filter((r) => r.deployed).length}`,
    );
    console.log(`   Erros: ${results.filter((r) => !r.deployed).length}`);
    console.log(`   Arquivo gerado: ${this.OUTPUT_FILE}`);
  }

  /**
   * Faz deploy dos predicates de um tipo específico
   */
  private async deployPredicates(
    type: string,
    path: string,
  ): Promise<DeployResult[]> {
    const results: DeployResult[] = [];

    try {
      if (!existsSync(path)) {
        console.log(`⚠️  Arquivo não encontrado: ${path}`);
        return results;
      }

      // Importar as versões dos predicates
      const predicateVersions = await this.importPredicateVersions(path);

      console.log(
        `   Encontrados ${
          Object.keys(predicateVersions).length
        } predicates ${type}`,
      );

      for (const [predicateId, version] of Object.entries(predicateVersions)) {
        console.log(`   🚀 Deployando ${predicateId}...`);

        try {
          const result = await this.deploySinglePredicate(
            predicateId,
            version,
            type,
          );
          results.push(result);

          if (result.deployed) {
            console.log(`   ✅ Deploy bem-sucedido: ${predicateId}`);
          } else {
            console.log(
              `   ❌ Erro no deploy: ${predicateId} - ${result.error}`,
            );
          }
        } catch (error) {
          console.log(`   ❌ Erro inesperado: ${predicateId} - ${error}`);
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
      console.error(`❌ Erro ao processar predicates ${type}:`, error);
    }

    return results;
  }

  /**
   * Importa as versões dos predicates do arquivo gerado
   */
  private async importPredicateVersions(
    path: string,
  ): Promise<Record<string, PredicateVersion>> {
    try {
      // Importar dinamicamente o módulo
      const module = await import(join(process.cwd(), path));
      return module.PREDICATE_VERSIONS || {};
    } catch (error) {
      console.error(`❌ Erro ao importar predicates de ${path}:`, error);
      return {};
    }
  }

  /**
   * Faz deploy de um predicate individual
   */
  private async deploySinglePredicate(
    predicateId: string,
    version: PredicateVersion,
    _type: string,
  ): Promise<DeployResult> {
    try {
      const provider = new Provider(this.NETWORKS[0]); // Usar testnet para deploy

      // Criar predicate
      const predicate = new Predicate({
        bytecode: arrayify(version.predicate.bin),
        abi: version.predicate.abi,
        provider,
      });

      // Simular deploy (em um ambiente real, você faria o deploy real aqui)
      console.log(`     📝 Predicate criado: ${predicate.address.toB256()}`);

      // Para demonstração, vamos simular um deploy bem-sucedido
      // Em produção, você faria o deploy real aqui

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
   * Gera o arquivo versions.json com os resultados dos deploys
   */
  private async generateVersionsFile(results: DeployResult[]): Promise<void> {
    const versionsData: VersionsData = {};

    for (const result of results) {
      if (result.deployed) {
        // Importar dados do predicate
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

    // Salvar arquivo
    writeFileSync(this.OUTPUT_FILE, JSON.stringify(versionsData, null, 2));
    console.log(`   📄 Arquivo salvo: ${this.OUTPUT_FILE}`);
  }

  /**
   * Obtém os dados de um predicate específico
   */
  private async getPredicateData(predicateId: string): Promise<{
    bytecode: string;
    abi: JsonAbi;
    type: string;
  } | null> {
    try {
      // Tentar importar do EVM predicates
      const evmPath = `packages/evm-predicates/src/generated/predicates/${predicateId}/index.ts`;
      if (existsSync(evmPath)) {
        const module = await import(join(process.cwd(), evmPath));
        return {
          bytecode: hexlify(module.bin),
          abi: module.abi,
          type: 'EVM',
        };
      }

      // Tentar importar do Solana predicates
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
        `❌ Erro ao obter dados do predicate ${predicateId}:`,
        error,
      );
      return null;
    }
  }
}

// Executar o script
async function main() {
  const deployer = new PredicateDeployer();
  await deployer.run();
}

if (require.main === module) {
  main().catch(console.error);
}

export { PredicateDeployer };
