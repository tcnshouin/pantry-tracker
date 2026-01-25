// De Castro | Paz | Pena | Tongson | Tura - November 18, 2025 - Finals Assessment Proglad
#include <iostream>
#include <iomanip>
#include <string>
#include <fstream>
using namespace std;

int getInt(string msg) {
    int x;
    while (true) {
        cout << msg;
        cin >> x;
        if (!cin.fail()) {
            cin.ignore(10000, '\n');
            return x;
        }
        cin.clear();
        cin.ignore(10000, '\n');
        cout << "Invalid input. Numbers only.\n";
    }
}

double getDouble(string msg) {
    double d;
    while (true) {
        cout << msg;
        cin >> d;
        if (!cin.fail()) {
            cin.ignore(10000, '\n');
            return d;
        }
        cin.clear();
        cin.ignore(10000, '\n');
        cout << "Invalid input. Enter a number.\n";
    }
}

void border() { cout << "************************************************************\n"; }

string name[100];
double prices[100];

void start() {
    border();
    cout << " Welcome to QuickCart! Where technology meets convenience!\n";
    border();
}


int quantity[100];
int n = 0;

void border_2() { cout << "------------------------------------------------------------\n"; }

void menu() {
    cout << "\t\t\t\t\t\tMain Menu\n";
    border_2();
    cout << "1. Add a new item\n";
    cout << "2. Delete an item\n";
    cout << "3. View items\n";
    cout << "4. Order item\n";
    cout << "5. Item Sales\n";
    cout << "6. Exit\n";
    border();
}

void getItem() {
    border();
    cout << "\tItem Adding, Please Enter The following Information!\n";
    border_2();
    cout << "Enter item name: ";
    getline(cin, name[n]);
    prices[n] = getDouble("Enter item price: ");
    quantity[n] = getInt("Enter item quantity: ");
    border();
    cout << "\t\t\t\t\t  Item Details\n";
    border();
    cout << "Item Number: " << n + 1 << endl;
    cout << fixed << setprecision(2);
    cout << "Item Name: " << name[n] << endl;
    cout << "Item Price: P " << prices[n] << endl;
    cout << "Item Quantity: " << quantity[n] << endl;
    border_2();
    n++;
}

int cart_index[100];

void viewItems() {
    border();
    if (n == 0) {
        border();
        cout << "No items yet. Please add items in the Main Menu!\n";
    } else {
        cout << "\t\t\t\t\tItem List\n";
        border_2();
        for (int i = 0; i < n; i++) {
            cout << i + 1 << ". Item Name: " << name[i] << endl;
            cout << "   Item Price: P " << fixed << setprecision(2) << prices[i] << endl;
            if (quantity[i] == 0) cout << "   Quantity: Out of Stock\n";
            else cout << "   Quantity: " << quantity[i] << "\n";
            cout << endl;
        }
    }
    border();
}

int cart_quantity[100];

void deleteItem() {
    viewItems();
    if (n > 0) {
        int it_n = getInt("Enter item number to delete: ");
        while (it_n > n || it_n <= 0) {
            it_n = getInt("Please Enter a valid Item number: ");
        }
        it_n--;
        for (int i = it_n; i < n - 1; i++) {
            name[i] = name[i + 1];
            prices[i] = prices[i + 1];
            quantity[i] = quantity[i + 1];
        }
        n--;
        border();
        cout << "\t\t\t\t\tItem Deleted!\n";
        border();
    }
}

int cartCount = 0;

int availableStock(int idx) {
    int stock = quantity[idx];
    for (int i = 0; i < cartCount; i++) {
        if (cart_index[i] == idx) stock -= cart_quantity[i];
    }
    return stock;
}

void addToCart(int index, int q) {
    for (int i = 0; i < cartCount; i++) {
        if (cart_index[i] == index) {
            if (cart_quantity[i] + q > quantity[index]) {
                cout << "Total quantity exceeds stock. Available: " << quantity[index] << "\n";
                return;
            }
            cart_quantity[i] += q;
            cout << "Quantity updated in cart.\n";
            return;
        }
    }
    cart_index[cartCount] = index;
    cart_quantity[cartCount] = q;
    cartCount++;
    cout << "Added to cart.\n";
}

void viewCart() {
    border();
    cout << "\t\t\t\tCart\n";
    border_2();
    if (cartCount == 0) {
        cout << "Cart is empty.\n";
        border();
        return;
    }
    double overall = 0.0;
    for (int i = 0; i < cartCount; i++) {
        int idx = cart_index[i];
        double subtotal = prices[idx] * cart_quantity[i];
        overall += subtotal;
        cout << i + 1 << ". " << name[idx] << " | Quantity: " << cart_quantity[i]
             << " | Price: P " << prices[idx]
             << " | Subtotal: P " << subtotal << endl;
    }
    border_2();
    cout << "Overall: P " << overall << endl;
    border();
}

void printReceipt() {
    border();
    cout << "\t\t\t\t\tFINAL RECEIPT\n";
    border_2();
    double overall = 0.0;
    for (int i = 0; i < cartCount; i++) {
        int idx = cart_index[i];
        double subtotal = prices[idx] * cart_quantity[i];
        overall += subtotal;
        cout << name[idx] << " | Quantity: " << cart_quantity[i]
             << " | Item Total: P " << subtotal << endl;
    }
    border_2();
    cout << "TOTAL: P " << overall << endl;
    border();
}

void saveSale() {
    ofstream file("sales.txt", ios::app);
    if (!file) {
        cout << "Unable to open sales file.\n";
        return;
    }
    file << "------------------------- RECEIPT -------------------------\n";
    double total = 0.0;
    for (int i = 0; i < cartCount; i++) {
        int idx = cart_index[i];
        double subtotal = prices[idx] * cart_quantity[i];
        total += subtotal;
        file << name[idx] << " | Quantity: " << cart_quantity[i]
             << " | Item Total: P " << subtotal << "\n";
    }
    file << "TOTAL: P " << total << "\n";
    file << "-----------------------------------------------------------\n\n";
    file.close();
}

void confirmAndCheckout() {
    printReceipt();
    cout << "Confirm checkout?\n";
    border();
    cout << "1. Yes\n2. No (return to Order Menu)\n";
    border_2();
    int choice = getInt("Choose [1,2]: ");
    while (choice != 1 && choice != 2) {
        choice = getInt("Please input a valid option [1,2]: ");
    }
    if (choice == 1) {
        for (int i = 0; i < cartCount; i++) {
            int idx = cart_index[i];
            quantity[idx] -= cart_quantity[i];
        }
        saveSale();
        cartCount = 0;
        cout << "Checkout complete.\n";
    } else {
        cout << "Returning to Order Menu.\n";
    }
}

void checkout() {
    if (cartCount == 0) {
        cout << "Cart is empty.\n";
        return;
    }
    confirmAndCheckout();
}

void cancelOrder() {
    if (cartCount == 0) cout << "Cart already empty.\n";
    else {
        cartCount = 0;
        cout << "Order cancelled.\n";
    }
}

bool getOrd() {
    border();
    cout << "\t\t\t\t\t\t Order Menu\n";
    border_2();
    cout << "1. Order an Item\n";
    cout << "2. View Cart\n";
    cout << "3. Checkout\n";
    cout << "4. Cancel Order\n";
    cout << "5. Back to Main Menu\n";
    border();

    int ordOpt = getInt("Choose an option: ");

    if (ordOpt == 1) {

        if (n == 0) {
            cout << "No items available yet. Add items first.\n";
            return true;
        }

        viewItems();
        int item = getInt("Enter item number: ");
        while (item < 1 || item > n) item = getInt("Invalid. Enter item number: ");

        int ind = item - 1;
        int avail = availableStock(ind);

        if (avail == 0) {
            cout << "This item is Out of Stock. Returning to Order Menu.\n";
            return true;
        }

        int q = getInt("Enter quantity (Available: " + to_string(avail) + "): ");
        while (q < 1 || q > avail) q = getInt("Invalid. Enter quantity again: ");

        addToCart(ind, q);
        return true;
    }

    if (ordOpt == 2) { viewCart(); return true; }
    if (ordOpt == 3) { checkout(); return true; }
    if (ordOpt == 4) { cancelOrder(); return true; }
    if (ordOpt == 5) return false;

    cout << "Invalid option.\n";
    return true;
}

void viewSales() {
    ifstream file("sales.txt");
    if (!file) {
        cout << "No sales recorded yet.\n";
        return;
    }
    string line;
    border();
    cout << "\t\t\t\t\t\tItem Sales\n";
    border_2();
    while (getline(file, line)) cout << line << endl;
    border();
    file.close();
}

bool getOpt() {
    menu();
    int opt = getInt("Choose an option: ");
    switch (opt) {
        case 1: getItem(); return true;
        case 2: deleteItem(); return true;
        case 3: viewItems(); return true;
        case 4: while (getOrd()); return true;
        case 5: viewSales(); return true;
        case 6: return false;
        default: cout << "Invalid option.\n"; return true;
    }
}

void exitProgram() {
    border();
    cout << "\nExiting Program...\n";
    border();
    cout << "Thanks for using QuickCart!\n";
    border();
}

int main() {
    start();
    bool temp = true;
    while (temp) temp = getOpt();
    exitProgram();
    return 0;
}
