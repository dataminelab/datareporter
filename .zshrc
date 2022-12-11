export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
#eval "$(pyenv init -)"
eval "$(pyenv init - --path)"
eval "$(pyenv virtualenv-init -)"
# activate virtual environment
source ~/.pyenv/versions/.venv/bin/activate