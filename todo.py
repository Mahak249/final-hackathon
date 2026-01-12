"""Main entry point for Phase I Todo App."""

from cli import CLI


def main():
    """Run the todo application."""
    cli = CLI()
    cli.run()


if __name__ == "__main__":
    main()
