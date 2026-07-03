{
  description = "Integrated Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:

  let
    system = "x86_64-linux";

    pkgs = import nixpkgs {
      inherit system;
      config.allowUnfree = true;
      #cudaSupport = true;
    };

    py = pkgs.python3Packages;
    
  in {
    devShells.${system}.default =
      pkgs.mkShell {
        packages = with pkgs; [
          nodejs

          pnpm
          yarn
          tsx

          typescript

          git
          curl
          wget
          jq

          openssl
          zlib
          libev
          sqlite

          protobuf
          wasmtime

          gcc
          
          clang
          clang-tools
          
          llvm
          lldb
          
          cmake
          ninja
          pkg-config

          gdb
          valgrind

          bear

          python3
          py.pip
          py.virtualenv

          ocaml

          dune
          opam

          go

          #cudaPackages.cuda_nvcc
          #cudaPackages.cudatoolkit
          #cudaPackages.cuda_cudart
          #cudaPackages.cuda_cccl

          #cudaPackages.nsight_compute
          #cudaPackages.nsight_systems

          zig

          vulkan-tools

          shaderc
          spirv-tools
          spirv-headers

          vulkan-loader
          vulkan-headers
          vulkan-validation-layers

          mesa
          glfw
          glm

          freetype

          php
          phpPackages.composer

          swi-prolog
        ];

        shellHook = ''
		      export CC=clang
		      export CXX=clang++
		      export PYTHONUNBUFFERED=1

		      export VK_LAYER_PATH="${pkgs.vulkan-validation-layers}/share/vulkan/explicit_layer.d"

		      # export LD_LIBRARY_PATH="/run/opengl-driver/lib:$LD_LIBRARY_PATH"

		      # export CUDA_HOME=${pkgs.cudaPackages.cudatoolkit}
		      # export CUDA_PATH=${pkgs.cudaPackages.cudatoolkit}

          export GOPATH="$PWD/.go"
          export GOBIN="$GOPATH/bin"
          export PATH="$GOBIN:$PATH"

		      echo ""
		      echo "=========================================="
		      echo " Integrated Development Environment"
		      echo "=========================================="
		      echo ""

		      echo "Node.js : $(node --version)"
		      echo "NPM     : $(npm --version)"
		      echo "PNPM    : $(pnpm --version)"
		      echo "Yarn    : $(yarn --version)"
		      echo "TS      : $(tsc --version)"
		      echo ""

		      echo "Python  : $(python --version)"
		      echo "OCaml   : $(ocaml -version)"
		      echo "Dune    : $(dune --version)"
		      echo "OPAM    : $(opam --version)"
		      echo ""

		      echo "Zig     : $(zig version)"
		      echo "Clang   : $(clang --version | head -n1)"
		      echo ""

          echo "PHP     : $(php --version | head -n1)"
          echo "Composer: $(composer --version)"
          echo ""

          echo "Go      : $(go version)"
          echo ""

          echo "Prolog : $(swipl --version)"
          echo ""

		      echo "Common Commands:"
		      echo "  npm install"
		      echo "  pnpm install"
		      echo "  yarn install"
		      echo "  tsx src/index.ts"
		      echo "  tsc --watch"
		      echo ""

		      echo "Python:"
		      echo "  python -m venv .venv"
		      echo "  source .venv/bin/activate"
		      echo ""

		      echo "C++ (clang):"
		      echo '  clang++ src/main.cpp src/glad.cpp -std=c++23 -Iinclude $(pkg-config --cflags --libs glfw3 freetype2 vulkan sqlite3 libcurl zlib) -o ranch'
		      echo ""

		      echo "C++ (zig):"
		      echo '  zig c++ src/main.cpp src/glad.cpp -std=c++23 -Iinclude $(pkg-config --cflags --libs glfw3 freetype2 vulkan sqlite3 libcurl zlib) -o ranch'
		      echo ""

          echo "PHP:"
          echo "  composer install"
          echo "  php artisan serve"
          echo "  php -S localhost:8000"
          echo ""

          echo "Go:"
          echo "  go mod init example"
          echo "  go get ./..."
          echo "  go run ."
          echo "  go build"
          echo "  go test ./..."
          echo ""

          echo "Prolog:"
          echo "  swipl"
          echo "  swipl file.pl"
          echo "  swipl -q -s file.pl"
          echo ""

		      # echo ""
		      # echo "=========================================="
		      # echo " CUDA SUPPORT"
		      # echo "=========================================="
		      # echo ""

		      # echo "CUDA Toolkit:"
		      # nvcc --version || true

		      # echo ""
		      # echo "GPU:"
		      # nvidia-smi --query-gpu=name --format=csv,noheader || true

		      # echo ""
		      # echo "Nsight Compute:"
		      # ncu --version | head -n1 || true

		      # echo ""
		      # echo "Nsight Systems:"
		      # nsys --version || true

		      # echo ""
		      # echo "Environment Ready:"
		      # echo "  Native CUDA Development"
		      # echo "  CUDA Kernel Optimization"
		      # echo "  Profiler Integration"
		      # echo ""
        '';
      };
  };
}
