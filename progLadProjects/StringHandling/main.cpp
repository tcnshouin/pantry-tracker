#include <iostream>
#include <string>


using namespace std;

int main() {

    //using compare function

    string word1 = "Hello";
    string word2 = "World";

    word1.append(" ");

    cout << word1 + word2 << endl;
    return 0;
}