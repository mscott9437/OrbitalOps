{
  description = "Node.js Development Environment with Binary Support";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      
      # Define the libraries that most Node binaries (like workerd/miniflare) need
      libPath = with pkgs; lib.makeLibraryPath [
        stdenv.cc.cc.lib
        zlib
        openssl
        libuuid
      ];
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs_20
          nodePackages.npm
          nodePackages.typescript-language-server
        ];

        shellHook = ''
          # These variables allow unpatched binaries to find their libraries
          export LD_LIBRARY_PATH="${libPath}:$LD_LIBRARY_PATH"
          
          # If you have nix-ld enabled globally, this helps it find the right loader
          export NIX_LD_LIBRARY_PATH="${libPath}"
          
          echo "🚀 Nix Node.js Environment Loaded"
          echo "Node version: $(node -v)"
          echo "Libraries linked for native modules: zlib, openssl, libuuid"
        '';
      };
    };
}
