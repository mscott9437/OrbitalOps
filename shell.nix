{ pkgs ? import <nixpkgs> {} }:

let
  # Fetch a newer nixpkgs pin that includes Hugo >= 0.160.0
  newerPkgs = import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-unstable.tar.gz") {};
in
pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    pkgs.typescript 
    pkgs.yarn
    pkgs.typescript-language-server
    pkgs.buildPackages.libcxx
    pkgs.openssl
    pkgs.git
    newerPkgs.hugo # Uses the upgraded Hugo from unstable
  ];

  shellHook = ''
    echo "Entering development shell.."
    echo "node $(node --version)"
    echo "typescript $(tsc --version | awk '{print $2}')"
    echo "yarn $(yarn --version)"
    echo "hugo $(hugo version)"
  '';
}
