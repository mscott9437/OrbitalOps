{
  description = "Node.js + TypeScript IPC Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:

  let
    system = "x86_64-linux";

    pkgs = import nixpkgs {
      inherit system;
    };
    
  in {
    devShells.${system}.default =
      pkgs.mkShell {
        packages = with pkgs; [
          # Runtime
          nodejs

          # Package Managers
          pnpm
          yarn

          # TypeScript
          typescript

          # Development Tools
          git
          curl
          jq

          openssl
          zlib
          libev
          sqlite

          # Optional future IPC / serialization
          protobuf

          # Native build tools
          gcc
          pkg-config
        ];

        shellHook = ''
          echo ""
          echo "=== Node.js + TypeScript Development Shell ==="
          echo "Node: $(node --version)"
          echo "NPM:  $(npm --version)"
          echo "TS:   $(tsc --version)"
          echo ""

          echo "Common Commands:"
          echo "  npm install"
          echo "  pnpm install"
          echo "  yarn install"
          echo "  tsx src/index.ts"
          echo "  tsc --watch"
          echo ""
        '';
      };
  };
}
